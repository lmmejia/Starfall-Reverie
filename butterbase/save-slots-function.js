/**
 * Deployed on Butterbase as HTTP function `save-slots`.
 * Source mirror only — redeploy via MCP deploy_function or Dashboard.
 *
 * Anonymous saves use save_subject anon:<installation_uuid>; signed-in saves use
 * user:<butterbase_user_id> from ctx.user when the trigger allows JWT (optional auth).
 */

export default async function handler(req, ctx) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const jsonHdr = Object.assign({}, corsHeaders, {
    "Content-Type": "application/json",
  });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: jsonHdr,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: jsonHdr,
    });
  }

  const action = body.action;
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  try {
    await ctx.db.query(
      "UPDATE game_saves SET save_subject = 'anon:' || installation_id::text WHERE save_subject IS NULL OR save_subject = ''"
    );
  } catch (e) {
    console.warn("migrate_save_subject", String(e && e.message));
  }

  function resolveSubject() {
    const uidRaw =
      ctx.user != null &&
      typeof ctx.user === "object" &&
      "id" in ctx.user &&
      ctx.user.id != null &&
      String(ctx.user.id).length > 0
        ? String(ctx.user.id).trim()
        : "";
    if (uidRaw) {
      return { subject: `user:${uidRaw}`, installationUuid: null };
    }

    var installationId = body.installation_id;
    if (
      !installationId ||
      typeof installationId !== "string" ||
      !uuidRe.test(installationId)
    ) {
      return { subject: "", installationUuid: null };
    }

    return {
      subject: `anon:${installationId}`,
      installationUuid: installationId,
    };
  }

  var resolved = resolveSubject();
  var subject = resolved.subject;
  var installationUuid = resolved.installationUuid;

  if (!subject) {
    return new Response(JSON.stringify({ error: "bad_installation_id" }), {
      status: 400,
      headers: jsonHdr,
    });
  }

  if (action === "list") {
    var rows = await ctx.db.query(
      "SELECT slot_index, label, payload, updated_at FROM game_saves WHERE save_subject = $1 ORDER BY slot_index ASC",
      [subject]
    );
    return new Response(JSON.stringify({ slots: rows.rows }), {
      status: 200,
      headers: jsonHdr,
    });
  }

  if (action === "save") {
    var slotNum = Number(body.slot_index);
    if (slotNum !== 1 && slotNum !== 2 && slotNum !== 3) {
      return new Response(JSON.stringify({ error: "bad_slot" }), {
        status: 400,
        headers: jsonHdr,
      });
    }

    var label =
      typeof body.label === "string" ? body.label.slice(0, 48) : "";
    var payload =
      body.payload && typeof body.payload === "object" && body.payload !== null
        ? body.payload
        : {};

    var ins = await ctx.db.query(
      `INSERT INTO game_saves (installation_id, slot_index, label, payload, save_subject)
       VALUES ($1::uuid, $2, $3, $4::jsonb, $5)
       ON CONFLICT (save_subject, slot_index)
       DO UPDATE SET
         label = EXCLUDED.label,
         payload = EXCLUDED.payload,
         updated_at = now(),
         installation_id = COALESCE(game_saves.installation_id, EXCLUDED.installation_id)
       RETURNING slot_index, label, payload, updated_at`,
      [
        installationUuid,
        slotNum,
        label,
        JSON.stringify(payload),
        subject,
      ]
    );

    return new Response(JSON.stringify({ slot: ins.rows[0] }), {
      status: 200,
      headers: jsonHdr,
    });
  }

  if (action === "delete") {
    var delSlot = Number(body.slot_index);
    if (delSlot !== 1 && delSlot !== 2 && delSlot !== 3) {
      return new Response(JSON.stringify({ error: "bad_slot" }), {
        status: 400,
        headers: jsonHdr,
      });
    }
    await ctx.db.query(
      "DELETE FROM game_saves WHERE save_subject = $1 AND slot_index = $2",
      [subject, delSlot]
    );
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: jsonHdr,
    });
  }

  return new Response(JSON.stringify({ error: "unknown_action" }), {
    status: 400,
    headers: jsonHdr,
  });
}
