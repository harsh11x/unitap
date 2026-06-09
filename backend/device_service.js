function createDeviceService({
  supabase,
  throwIfSupabaseError,
  hashPassword,
  verifyPassword,
  publicDevice,
  signDeviceToken,
}) {
  async function registerDevice(payload) {
    const shopkeeper = await supabase
      .from("shopkeepers")
      .select("*")
      .eq("id", payload.shopkeeperId)
      .maybeSingle()
    throwIfSupabaseError(shopkeeper.error)
    if (!shopkeeper.data) {
      const error = new Error("Shopkeeper not found.")
      error.statusCode = 404
      throw error
    }

    let universityId = payload.universityId || null
    if (!universityId && shopkeeper.data.university_registration_id) {
      const university = await supabase
        .from("universities")
        .select("id")
        .eq("registration_id", shopkeeper.data.university_registration_id)
        .maybeSingle()
      throwIfSupabaseError(university.error)
      universityId = university.data?.id || null
    }

    const device = await supabase
      .from("payment_devices")
      .upsert(
        {
          device_id: payload.deviceId,
          device_secret_hash: await hashPassword(payload.deviceSecret),
          shopkeeper_id: payload.shopkeeperId,
          university_id: universityId,
          label: payload.label || payload.deviceId,
          status: payload.status || "active",
          state: "idle",
          metadata: payload.metadata || {},
        },
        { onConflict: "device_id" }
      )
      .select()
      .single()
    throwIfSupabaseError(device.error)
    return device.data
  }

  async function connectDevice(deviceId, deviceSecret) {
    const device = await supabase
      .from("payment_devices")
      .select("*")
      .eq("device_id", deviceId)
      .maybeSingle()
    throwIfSupabaseError(device.error)

    if (!device.data || !(await verifyPassword(deviceSecret, device.data.device_secret_hash))) {
      const error = new Error("Invalid device credentials.")
      error.statusCode = 401
      throw error
    }
    if (device.data.status !== "active") {
      const error = new Error("Device is not active.")
      error.statusCode = 403
      throw error
    }

    const update = await supabase
      .from("payment_devices")
      .update({ state: "idle", last_seen: new Date().toISOString() })
      .eq("id", device.data.id)
      .select()
      .single()
    throwIfSupabaseError(update.error)

    const token = signDeviceToken({
      sub: device.data.id,
      deviceId: device.data.device_id,
      shopkeeperId: device.data.shopkeeper_id,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })

    return { token, expiresIn: 24 * 60 * 60, device: update.data }
  }

  async function heartbeat(deviceIdOrUuid, state = "idle", metadata = {}) {
    let query = supabase
      .from("payment_devices")
      .update({ state, last_seen: new Date().toISOString(), metadata })

    query = String(deviceIdOrUuid).includes("-") && deviceIdOrUuid.length > 20
      ? query.eq("id", deviceIdOrUuid)
      : query.eq("device_id", deviceIdOrUuid)

    const update = await query.select().single()
    throwIfSupabaseError(update.error)
    return update.data
  }

  async function deviceStatus(deviceId) {
    const device = await supabase
      .from("payment_devices")
      .select("*")
      .eq("device_id", deviceId)
      .maybeSingle()
    throwIfSupabaseError(device.error)
    return device.data ? publicDevice(device.data) : null
  }

  return { registerDevice, connectDevice, heartbeat, deviceStatus }
}

module.exports = { createDeviceService }
