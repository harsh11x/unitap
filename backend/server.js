require("dotenv").config({ path: require("path").join(__dirname, ".env") })

const http = require("http")
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const Razorpay = require("razorpay")
const { createClient } = require("@supabase/supabase-js")

const PORT = Number(process.env.PORT || 4000)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
    : null

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
  res.end(JSON.stringify(payload))
}

function ensureSupabase(res) {
  if (supabase) return true
  sendJson(res, 500, {
    error:
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env.",
  })
  return false
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk
    })
    req.on("end", () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  })
}

function requireFields(payload, fields) {
  const missing = fields.filter((field) => !String(payload[field] ?? "").trim())
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`
  }
  return null
}

function publicStudent(student) {
  return {
    id: student.id,
    studentId: student.student_id,
    universityName: student.university_name,
    city: student.city,
    state: student.state,
    country: student.country,
    dob: student.dob,
    walletBalance: Number(student.wallet_balance || 0),
    createdAt: student.created_at,
  }
}

function publicUniversity(university) {
  return {
    id: university.id,
    name: university.name,
    address: university.address,
    officialEmail: university.official_email,
    phone: university.phone,
    website: university.website,
    registrationId: university.registration_id,
    status: university.status,
    createdAt: university.created_at,
  }
}

function publicShopkeeper(shopkeeper) {
  return {
    id: shopkeeper.id,
    shopName: shopkeeper.shop_name,
    location: shopkeeper.location,
    email: shopkeeper.email,
    phone: shopkeeper.phone,
    universityRegistrationId: shopkeeper.university_registration_id,
    status: shopkeeper.status,
    products: shopkeeper.products || [],
    createdAt: shopkeeper.created_at,
  }
}

async function track(table, role, identifier) {
  await supabase.from(table).insert({ role, identifier })
}

async function getOverview() {
  const [
    universitiesResult,
    shopsResult,
    studentsResult,
    authEventsResult,
    signupEventsResult,
    authCountResult,
    signupCountResult,
  ] = await Promise.all([
    supabase.from("universities").select("*").order("created_at", { ascending: false }),
    supabase.from("shopkeepers").select("*").order("created_at", { ascending: false }),
    supabase.from("students").select("id"),
    supabase.from("auth_events").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("signup_events").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("auth_events").select("id", { count: "exact", head: true }),
    supabase.from("signup_events").select("id", { count: "exact", head: true }),
  ])

  throwIfSupabaseError(universitiesResult.error)
  throwIfSupabaseError(shopsResult.error)
  throwIfSupabaseError(studentsResult.error)
  throwIfSupabaseError(authEventsResult.error)
  throwIfSupabaseError(signupEventsResult.error)
  throwIfSupabaseError(authCountResult.error)
  throwIfSupabaseError(signupCountResult.error)

  const universities = universitiesResult.data.map((university) => {
    const shops = shopsResult.data.filter(
      (shop) => shop.university_registration_id === university.registration_id
    )

    return {
      ...publicUniversity(university),
      canteens: shops.length,
      pendingShops: shops.filter((shop) => shop.status === "pending-approval").length,
      bannedShops: shops.filter((shop) => shop.status === "banned").length,
    }
  })

  return {
    totals: {
      universities: universitiesResult.data.length,
      shopkeepers: shopsResult.data.length,
      students: studentsResult.data.length,
      canteens: shopsResult.data.length,
      logins: authCountResult.count || 0,
      signups: signupCountResult.count || 0,
    },
    universities,
    recentLogins: authEventsResult.data.map(publicEvent),
    recentSignups: signupEventsResult.data.map(publicEvent),
  }
}

function publicEvent(event) {
  return {
    id: event.id,
    role: event.role,
    identifier: event.identifier,
    at: event.created_at,
  }
}

function throwIfSupabaseError(error) {
  if (error) throw new Error(error.message)
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

async function findLoginByIdentifier(identifier) {
  const normalized = String(identifier || "").trim()
  if (!normalized) return null

  const student = await supabase
    .from("students")
    .select("*")
    .eq("student_id", normalized)
    .maybeSingle()
  throwIfSupabaseError(student.error)
  if (student.data) return { role: "student", record: student.data, identifier: student.data.student_id }

  const university = await supabase
    .from("universities")
    .select("*")
    .eq("official_email", normalized)
    .maybeSingle()
  throwIfSupabaseError(university.error)
  if (university.data) {
    return { role: "university", record: university.data, identifier: university.data.official_email }
  }

  const shopkeeper = await supabase
    .from("shopkeepers")
    .select("*, products(*)")
    .or(`email.eq.${escapeSupabaseValue(normalized)},phone.eq.${escapeSupabaseValue(normalized)}`)
    .maybeSingle()
  throwIfSupabaseError(shopkeeper.error)
  if (shopkeeper.data) {
    return { role: "shopkeeper", record: shopkeeper.data, identifier: shopkeeper.data.email }
  }

  if (
    process.env.SUPER_ADMIN_EMAIL &&
    process.env.SUPER_ADMIN_PASSWORD &&
    normalized === process.env.SUPER_ADMIN_EMAIL
  ) {
    return {
      role: "superAdmin",
      record: {
        id: "env-super-admin",
        email: process.env.SUPER_ADMIN_EMAIL,
        name: process.env.SUPER_ADMIN_NAME || "Super Admin",
        password_hash: await hashPassword(process.env.SUPER_ADMIN_PASSWORD),
      },
      identifier: process.env.SUPER_ADMIN_EMAIL,
    }
  }

  const superAdmin = await supabase
    .from("super_admins")
    .select("*")
    .eq("email", normalized)
    .maybeSingle()
  throwIfSupabaseError(superAdmin.error)
  if (superAdmin.data) {
    return { role: "superAdmin", record: superAdmin.data, identifier: superAdmin.data.email }
  }

  return null
}

function escapeSupabaseValue(value) {
  return String(value).replaceAll(",", "\\,")
}

async function publicLoginPayload(match) {
  if (match.role === "student") return { role: "student", user: publicStudent(match.record) }
  if (match.role === "university") return { role: "university", user: publicUniversity(match.record) }
  if (match.role === "shopkeeper") return { role: "shopkeeper", user: publicShopkeeper(match.record) }
  return {
    role: "superAdmin",
    user: { id: match.record.id, email: match.record.email, name: match.record.name },
    overview: await getOverview(),
  }
}

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true })
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname

  try {
    if (req.method === "GET" && path === "/health") {
      sendJson(res, 200, {
        ok: true,
        service: "UniTap backend",
        port: PORT,
        supabaseConfigured: Boolean(supabase),
        razorpayConfigured: Boolean(razorpay),
      })
      return
    }

    if (!ensureSupabase(res)) return

    if (req.method === "GET" && path === "/api/super-admin/overview") {
      sendJson(res, 200, await getOverview())
      return
    }

    if (req.method === "GET" && path.startsWith("/api/university/") && path.endsWith("/shops")) {
      const registrationId = decodeURIComponent(path.split("/")[3])
      const shops = await supabase
        .from("shopkeepers")
        .select("*, products(*)")
        .eq("university_registration_id", registrationId)
        .order("created_at", { ascending: false })
      throwIfSupabaseError(shops.error)

      sendJson(res, 200, { shops: shops.data.map(publicShopkeeper) })
      return
    }

    const payload = await readBody(req)

    if (req.method === "POST" && path === "/api/student/signup") {
      const error = requireFields(payload, [
        "studentId",
        "universityName",
        "city",
        "state",
        "country",
        "dob",
        "password",
      ])
      if (error) return sendJson(res, 400, { error })

      const student = {
        student_id: payload.studentId,
        university_name: payload.universityName,
        city: payload.city,
        state: payload.state,
        country: payload.country,
        dob: payload.dob,
        password_hash: await hashPassword(payload.password),
        wallet_balance: 0,
      }
      const result = await supabase.from("students").insert(student).select().single()
      throwIfSupabaseError(result.error)
      await track("signup_events", "student", result.data.student_id)
      sendJson(res, 201, { message: "Student signup successful.", role: "student", user: publicStudent(result.data) })
      return
    }

    if (req.method === "POST" && path === "/api/student/login") {
      const error = requireFields(payload, ["studentId", "password"])
      if (error) return sendJson(res, 400, { error })

      await handleUniversalLogin(res, payload.studentId, payload.password)
      return
    }

    if (req.method === "POST" && path === "/api/student/reset-password") {
      const error = requireFields(payload, ["studentId", "dob", "newPassword"])
      if (error) return sendJson(res, 400, { error })

      const student = await supabase
        .from("students")
        .select("*")
        .eq("student_id", payload.studentId)
        .eq("dob", payload.dob)
        .maybeSingle()
      throwIfSupabaseError(student.error)
      if (!student.data) return sendJson(res, 404, { error: "Student ID and DOB did not match." })

      const update = await supabase
        .from("students")
        .update({ password_hash: await hashPassword(payload.newPassword) })
        .eq("id", student.data.id)
      throwIfSupabaseError(update.error)
      sendJson(res, 200, { message: "Student password reset successful." })
      return
    }

    if (req.method === "POST" && path === "/api/university/signup") {
      const error = requireFields(payload, [
        "name",
        "address",
        "officialEmail",
        "phone",
        "website",
        "registrationId",
        "password",
      ])
      if (error) return sendJson(res, 400, { error })

      const university = {
        name: payload.name,
        address: payload.address,
        official_email: payload.officialEmail,
        phone: payload.phone,
        website: payload.website,
        registration_id: payload.registrationId,
        password_hash: await hashPassword(payload.password),
        status: "pending-approval",
      }
      const result = await supabase.from("universities").insert(university).select().single()
      throwIfSupabaseError(result.error)
      await track("signup_events", "university", result.data.official_email)
      sendJson(res, 201, { message: "University signup submitted.", role: "university", user: publicUniversity(result.data) })
      return
    }

    if (req.method === "POST" && path === "/api/university/login") {
      const error = requireFields(payload, ["officialEmail", "password"])
      if (error) return sendJson(res, 400, { error })

      await handleUniversalLogin(res, payload.officialEmail, payload.password)
      return
    }

    if (req.method === "POST" && path === "/api/shopkeeper/signup") {
      const error = requireFields(payload, [
        "shopName",
        "location",
        "email",
        "phone",
        "universityRegistrationId",
        "password",
      ])
      if (error) return sendJson(res, 400, { error })

      const university = await supabase
        .from("universities")
        .select("registration_id")
        .eq("registration_id", payload.universityRegistrationId)
        .maybeSingle()
      throwIfSupabaseError(university.error)
      if (!university.data) {
        return sendJson(res, 404, { error: "University registration ID was not found." })
      }

      const products = Array.isArray(payload.products)
        ? payload.products
            .filter((product) => product.name && Number(product.price) >= 0)
            .map((product) => ({
              name: product.name,
              price: Number(product.price),
            }))
        : []

      const shopkeeper = {
        shop_name: payload.shopName,
        location: payload.location,
        email: payload.email,
        phone: payload.phone,
        university_registration_id: payload.universityRegistrationId,
        password_hash: await hashPassword(payload.password),
        status: "pending-approval",
      }
      const result = await supabase.from("shopkeepers").insert(shopkeeper).select().single()
      throwIfSupabaseError(result.error)

      if (products.length > 0) {
        const productResult = await supabase
          .from("products")
          .insert(products.map((product) => ({ ...product, shopkeeper_id: result.data.id })))
        throwIfSupabaseError(productResult.error)
      }

      const savedShopkeeper = await supabase
        .from("shopkeepers")
        .select("*, products(*)")
        .eq("id", result.data.id)
        .single()
      throwIfSupabaseError(savedShopkeeper.error)
      await track("signup_events", "shopkeeper", result.data.email)
      sendJson(res, 201, {
        message: products.length
          ? "Shopkeeper signup submitted with products for university approval."
          : "Shopkeeper signup submitted. Products can be added later.",
        role: "shopkeeper",
        user: publicShopkeeper(savedShopkeeper.data),
      })
      return
    }

    if (req.method === "POST" && path === "/api/shopkeeper/login") {
      const error = requireFields(payload, ["identifier", "password"])
      if (error) return sendJson(res, 400, { error })

      await handleUniversalLogin(res, payload.identifier, payload.password)
      return
    }

    if (req.method === "POST" && path === "/api/shopkeeper/products") {
      const error = requireFields(payload, ["shopkeeperId"])
      if (error) return sendJson(res, 400, { error })

      const products = Array.isArray(payload.products) ? payload.products : []
      const insert = await supabase
        .from("products")
        .insert(
          products
          .filter((product) => product.name && Number(product.price) >= 0)
          .map((product) => ({
            shopkeeper_id: payload.shopkeeperId,
            name: product.name,
            price: Number(product.price),
          }))
        )
      throwIfSupabaseError(insert.error)

      const shopkeeper = await supabase
        .from("shopkeepers")
        .select("*, products(*)")
        .eq("id", payload.shopkeeperId)
        .single()
      throwIfSupabaseError(shopkeeper.error)
      sendJson(res, 200, { message: "Products saved.", user: publicShopkeeper(shopkeeper.data) })
      return
    }

    if (req.method === "POST" && path.startsWith("/api/university/shops/")) {
      const [, , , , shopId, action] = path.split("/")
      const allowedActions = {
        approve: "approved",
        ban: "banned",
        suspend: "temporarily-stopped",
        activate: "approved",
      }

      if (!allowedActions[action]) {
        return sendJson(res, 400, { error: "Invalid shop action." })
      }

      const result = await supabase
        .from("shopkeepers")
        .update({ status: allowedActions[action] })
        .eq("id", shopId)
        .select("*, products(*)")
        .single()
      throwIfSupabaseError(result.error)
      sendJson(res, 200, { message: `Shop ${action} action applied.`, user: publicShopkeeper(result.data) })
      return
    }

    if (req.method === "POST" && path === "/api/super-admin/login") {
      const error = requireFields(payload, ["email", "password"])
      if (error) return sendJson(res, 400, { error })

      await handleUniversalLogin(res, payload.email, payload.password)
      return
    }

    if (req.method === "POST" && path === "/api/auth/login") {
      const error = requireFields(payload, ["identifier", "password"])
      if (error) return sendJson(res, 400, { error })

      await handleUniversalLogin(res, payload.identifier, payload.password)
      return
    }

    if (req.method === "POST" && path === "/api/wallet/topup/order") {
      if (!razorpay) {
        return sendJson(res, 500, {
          error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env.",
        })
      }

      const error = requireFields(payload, ["studentId", "amount"])
      if (error) return sendJson(res, 400, { error })

      const amount = Number(payload.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        return sendJson(res, 400, { error: "Amount must be greater than zero." })
      }

      const student = await supabase
        .from("students")
        .select("*")
        .eq("student_id", payload.studentId)
        .maybeSingle()
      throwIfSupabaseError(student.error)
      if (!student.data) return sendJson(res, 404, { error: "Student not found." })

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `unitap_${student.data.student_id}_${Date.now()}`,
      })

      const topup = await supabase.from("wallet_topups").insert({
        student_id: student.data.id,
        amount,
        razorpay_order_id: order.id,
        status: "created",
      })
      throwIfSupabaseError(topup.error)

      sendJson(res, 200, {
        keyId: RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      })
      return
    }

    if (req.method === "POST" && path === "/api/wallet/topup/verify") {
      const error = requireFields(payload, [
        "studentId",
        "razorpayOrderId",
        "razorpayPaymentId",
        "razorpaySignature",
      ])
      if (error) return sendJson(res, 400, { error })

      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
        .digest("hex")

      if (expectedSignature !== payload.razorpaySignature) {
        return sendJson(res, 400, { error: "Invalid Razorpay signature." })
      }

      const student = await supabase
        .from("students")
        .select("*")
        .eq("student_id", payload.studentId)
        .single()
      throwIfSupabaseError(student.error)

      const topup = await supabase
        .from("wallet_topups")
        .select("*")
        .eq("student_id", student.data.id)
        .eq("razorpay_order_id", payload.razorpayOrderId)
        .single()
      throwIfSupabaseError(topup.error)

      const newBalance = Number(student.data.wallet_balance || 0) + Number(topup.data.amount)
      const updateStudent = await supabase
        .from("students")
        .update({ wallet_balance: newBalance })
        .eq("id", student.data.id)
        .select()
        .single()
      throwIfSupabaseError(updateStudent.error)

      const updateTopup = await supabase
        .from("wallet_topups")
        .update({
          status: "paid",
          razorpay_payment_id: payload.razorpayPaymentId,
          razorpay_signature: payload.razorpaySignature,
        })
        .eq("id", topup.data.id)
      throwIfSupabaseError(updateTopup.error)

      sendJson(res, 200, {
        message: "Wallet top-up successful.",
        user: publicStudent(updateStudent.data),
      })
      return
    }

    sendJson(res, 404, { error: "Route not found." })
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected server error." })
  }
}

async function handleUniversalLogin(res, identifier, password) {
  const match = await findLoginByIdentifier(identifier)
  if (!match || !(await verifyPassword(password, match.record.password_hash))) {
    return sendJson(res, 401, { error: "Invalid credentials." })
  }

  await track("auth_events", match.role, match.identifier)
  const payload = await publicLoginPayload(match)
  sendJson(res, 200, {
    message: `${roleLabel(match.role)} login successful.`,
    ...payload,
  })
}

function roleLabel(role) {
  if (role === "superAdmin") return "Super admin"
  if (role === "university") return "University"
  return role[0].toUpperCase() + role.slice(1)
}

http.createServer(handleRequest).listen(PORT, () => {
  console.log(`UniTap backend running at http://localhost:${PORT}`)
})
