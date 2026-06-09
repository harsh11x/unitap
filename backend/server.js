require("dotenv").config({ path: require("path").join(__dirname, ".env") })

const http = require("http")
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const Razorpay = require("razorpay")
const { createClient } = require("@supabase/supabase-js")
const { createDeviceService } = require("./device_service")

const PORT = Number(process.env.PORT || 4000)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const DEVICE_TOKEN_SECRET = process.env.DEVICE_TOKEN_SECRET || process.env.SUPER_ADMIN_PASSWORD || "unitap-dev-device-token"

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
      })
    : null

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
    : null

const TEST_PASSWORD = process.env.UNITAP_TEST_PASSWORD || "unitap123"
const TEST_SHOP_PASSWORD = process.env.UNITAP_TEST_SHOP_PASSWORD || "shop123"
const testingPayments = new Map()
const testingPaymentHistory = []
const testingSeedStudents = [
  ["6E A2 D8 DB", "Harsh Dev Singh", "2024010007368"],
  ["13 91 E8 39", "Sehajpreet Kaur", "2025010012892"],
  ["83 B8 B0 39", "Ankita Rani", "2025010007274"],
  ["C3 F4 CB 38", "Arshnoor Kaur", "2025010003544"],
]
const testingStudents = new Map(
  testingSeedStudents.map(([uid, name, studentId]) => {
    const normalizedUid = String(uid).replaceAll(/[^a-fA-F0-9]/g, "").toUpperCase()
    return [
      normalizedUid,
      {
        student_id: studentId,
        name,
        email: `${studentId}@student.unitap.test`,
        rfid_uid: normalizedUid,
        wallet_balance: 1000,
        status: "active",
      },
    ]
  })
)
const testingTransactions = []

const deviceService = createDeviceService({
  supabase,
  throwIfSupabaseError,
  hashPassword,
  verifyPassword,
  publicDevice,
  signDeviceToken,
})

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  })
  res.end(JSON.stringify(payload))
}

function ensureSupabase(res) {
  if (supabase) return true
  sendJson(res, 500, {
    error:
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY, or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to backend/.env.",
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
    name: student.name,
    email: student.email,
    studentId: student.student_id,
    universityName: student.university_name,
    city: student.city,
    state: student.state,
    country: student.country,
    dob: student.dob,
    walletBalance: Number(student.wallet_balance || 0),
    status: student.status || "active",
    cardStatus: student.card_status || "active",
    createdAt: student.created_at,
  }
}

function publicTestingStudent(student) {
  return {
    id: student.student_id,
    isTesting: true,
    name: student.name,
    email: student.email,
    studentId: student.student_id,
    rfidUid: student.rfid_uid,
    walletBalance: Number(student.wallet_balance || 0),
    status: student.status || "active",
    cardStatus: "active",
    createdAt: student.created_at || null,
  }
}

function publicTestingShopkeeper() {
  return {
    id: "test-shop",
    isTesting: true,
    shopName: "UniTap Demo Shop",
    location: "RFID Testing Counter",
    email: "shop@unitap.test",
    phone: "9999999999",
    universityRegistrationId: "UNITAP-DEMO",
    status: "approved",
    products: [],
    createdAt: null,
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

function publicCard(card) {
  return {
    id: card.id,
    studentId: card.student_id,
    uidLast4: card.uid_last4,
    label: card.label,
    status: card.status,
    issuedAt: card.issued_at,
    frozenAt: card.frozen_at,
    lostReportedAt: card.lost_reported_at,
    createdAt: card.created_at,
  }
}

function publicTransaction(transaction) {
  return {
    id: transaction.id,
    receiptNo: transaction.receipt_no,
    studentId: transaction.student_id,
    shopkeeperId: transaction.shopkeeper_id,
    cardId: transaction.card_id,
    deviceId: transaction.device_id,
    paymentSessionId: transaction.payment_session_id,
    type: transaction.type,
    amount: Number(transaction.amount || 0),
    balanceBefore: Number(transaction.balance_before || 0),
    balanceAfter: Number(transaction.balance_after || 0),
    products: transaction.products || [],
    status: transaction.status,
    failureReason: transaction.failure_reason,
    metadata: transaction.metadata || {},
    createdAt: transaction.created_at,
  }
}

function publicDevice(device) {
  return {
    id: device.id,
    deviceId: device.device_id,
    shopkeeperId: device.shopkeeper_id,
    universityId: device.university_id,
    label: device.label,
    status: device.status,
    state: device.state,
    lastSeen: device.last_seen,
    metadata: device.metadata || {},
    createdAt: device.created_at,
  }
}

function publicPaymentSession(session) {
  return {
    id: session.id,
    paymentSessionId: session.payment_session_id,
    deviceId: session.device_id,
    shopkeeperId: session.shopkeeper_id,
    amount: Number(session.amount || 0),
    items: session.items || [],
    status: session.status,
    expiresAt: session.expires_at,
    confirmedAt: session.confirmed_at,
    transactionId: session.transaction_id,
    failureReason: session.failure_reason,
    createdAt: session.created_at,
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

  const testingStudentMatch = await findTestingStudentByStudentId(normalized)
  if (testingStudentMatch?.student) {
    return {
      role: "student",
      record: {
        ...testingStudentMatch.student,
        id: testingStudentMatch.student.student_id,
        is_testing: true,
        password_hash: bcrypt.hashSync(TEST_PASSWORD, 10),
      },
      identifier: testingStudentMatch.student.student_id,
    }
  }

  if (normalized === "shop@unitap.test" || normalized === "9999999999") {
    return {
      role: "shopkeeper",
      record: {
        ...publicTestingShopkeeper(),
        shop_name: "UniTap Demo Shop",
        password_hash: bcrypt.hashSync(TEST_SHOP_PASSWORD, 10),
      },
      identifier: "shop@unitap.test",
    }
  }

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

function normalizeUid(uid) {
  return String(uid || "")
    .trim()
    .replaceAll(/[^a-fA-F0-9]/g, "")
    .toUpperCase()
}

function hashUid(uid) {
  const normalized = normalizeUid(uid)
  if (!normalized) return ""
  return crypto.createHash("sha256").update(normalized).digest("hex")
}

function uidLast4(uid) {
  return normalizeUid(uid).slice(-4)
}

function receiptNo(prefix = "UTP") {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

function paymentSessionId() {
  return `pay_${crypto.randomBytes(12).toString("hex")}`
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url")
}

function signDeviceToken(payload) {
  const encoded = base64UrlEncode(payload)
  const signature = crypto.createHmac("sha256", DEVICE_TOKEN_SECRET).update(encoded).digest("base64url")
  return `${encoded}.${signature}`
}

function verifyDeviceToken(token) {
  const [encoded, signature] = String(token || "").split(".")
  if (!encoded || !signature) return null

  const expected = crypto.createHmac("sha256", DEVICE_TOKEN_SECRET).update(encoded).digest("base64url")
  if (signature.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

function bearerToken(req) {
  const header = req.headers.authorization || ""
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : ""
}

function sanitizeProducts(products) {
  if (!Array.isArray(products)) return []
  return products.map((product) => ({
    id: product.id || null,
    name: String(product.name || "Item"),
    price: Number(product.price || 0),
    quantity: Math.max(1, Number(product.quantity || product.qty || 1)),
  }))
}

function productTotal(products) {
  return sanitizeProducts(products).reduce(
    (total, product) => total + Number(product.price || 0) * Number(product.quantity || 1),
    0
  )
}

async function createNotification(recipientRole, recipientId, title, message, data = {}) {
  const result = await supabase.from("notifications").insert({
    recipient_role: recipientRole,
    recipient_id: recipientId,
    title,
    message,
    data,
  })
  throwIfSupabaseError(result.error)
}

async function auditLog(actorRole, actorId, action, entityType, entityId, metadata = {}) {
  const result = await supabase.from("audit_logs").insert({
    actor_role: actorRole,
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  })
  throwIfSupabaseError(result.error)
}

async function ensureWallet(student) {
  const existing = await supabase.from("wallets").select("*").eq("student_id", student.id).maybeSingle()
  throwIfSupabaseError(existing.error)
  if (existing.data) return existing.data

  const created = await supabase
    .from("wallets")
    .insert({
      student_id: student.id,
      balance: Number(student.wallet_balance || 0),
    })
    .select()
    .single()
  throwIfSupabaseError(created.error)
  return created.data
}

async function syncWalletBalance(studentId, balance) {
  const wallet = await supabase
    .from("wallets")
    .upsert({ student_id: studentId, balance, updated_at: new Date().toISOString() })
  throwIfSupabaseError(wallet.error)
}

function paymentLog(event, details = {}) {
  console.log(`[${new Date().toISOString()}] ${event}`, details)
}

function nextTestingPaymentId() {
  return "PAY001"
}

async function findTestingStudentByUid(uid) {
  const normalizedUid = normalizeUid(uid)
  if (!normalizedUid) return null
  if (!supabase) return { source: "memory", student: testingStudents.get(normalizedUid) || null }

  const result = await supabase
    .from("rfid_test_students")
    .select("*")
    .eq("rfid_uid", normalizedUid)
    .maybeSingle()

  if (!result.error && result.data) return { source: "database", student: result.data }
  return { source: "memory", student: testingStudents.get(normalizedUid) || null }
}

async function findTestingStudentByStudentId(studentId) {
  const normalizedStudentId = String(studentId || "").trim()
  if (!normalizedStudentId) return null
  if (!supabase) {
    const memoryStudent = [...testingStudents.values()].find((student) => student.student_id === normalizedStudentId)
    return { source: "memory", student: memoryStudent || null }
  }

  const result = await supabase
    .from("rfid_test_students")
    .select("*")
    .eq("student_id", normalizedStudentId)
    .maybeSingle()

  if (!result.error && result.data) return { source: "database", student: result.data }
  const memoryStudent = [...testingStudents.values()].find((student) => student.student_id === normalizedStudentId)
  return { source: "memory", student: memoryStudent || null }
}

async function updateTestingStudentBalance(source, student, balance) {
  if (source === "database" && supabase) {
    const result = await supabase
      .from("rfid_test_students")
      .update({ wallet_balance: balance })
      .eq("student_id", student.student_id)
      .select()
      .single()
    if (!result.error && result.data) return result.data
  }

  const updated = { ...student, wallet_balance: balance }
  testingStudents.set(normalizeUid(student.rfid_uid), updated)
  return updated
}

async function saveTestingTransaction(transaction) {
  if (supabase) {
    const result = await supabase.from("rfid_test_transactions").insert(transaction).select().single()
    if (!result.error && result.data) return result.data
  }

  const saved = {
    id: testingTransactions.length + 1,
    created_at: new Date().toISOString(),
    ...transaction,
  }
  testingTransactions.push(saved)
  return saved
}

async function recordTestingAttempt(payment, attempt) {
  const saved = await saveTestingTransaction({
    payment_id: payment.paymentId,
    device_id: payment.deviceId,
    student_id: attempt.studentId || null,
    uid: attempt.uid,
    amount: payment.amount,
    balance_after: attempt.balanceAfter ?? 0,
    status: attempt.status,
    failure_reason: attempt.failureReason || null,
  })

  const publicAttempt = {
    ...saved,
    paymentId: payment.paymentId,
    deviceId: payment.deviceId,
    studentId: attempt.studentId || null,
    uid: attempt.uid,
    amount: payment.amount,
    balanceAfter: attempt.balanceAfter ?? 0,
    status: attempt.status,
    failureReason: attempt.failureReason || null,
    createdAt: saved.created_at || new Date().toISOString(),
  }

  payment.attempts = [...(payment.attempts || []), publicAttempt]
  payment.lastAttempt = publicAttempt
  if (attempt.status === "failed") {
    payment.lastFailure = publicAttempt
  }
  return publicAttempt
}

async function resetTestingMode() {
  testingPayments.clear()
  testingPaymentHistory.length = 0
  testingTransactions.length = 0
  for (const [uid, student] of testingStudents.entries()) {
    testingStudents.set(uid, { ...student, wallet_balance: 1000 })
  }

  if (supabase) {
    await supabase.from("rfid_test_transactions").delete().neq("id", 0)
    for (const [uid, name, studentId] of testingSeedStudents) {
      const normalizedUid = normalizeUid(uid)
      await supabase.from("rfid_test_students").upsert(
        {
          student_id: studentId,
          name,
          email: `${studentId}@student.unitap.test`,
          rfid_uid: normalizedUid,
          wallet_balance: 1000,
          status: "active",
        },
        { onConflict: "rfid_uid" }
      )
    }
  }
}

async function handleTestingPaymentConfirm(res, payload) {
  const paymentId = payload.paymentId || payload.paymentSessionId || payload.sessionId
  const uid = normalizeUid(payload.uid)
  const payment = testingPayments.get(paymentId)

  paymentLog("CARD_DETECTED", { paymentId, uid })

  if (!payment) {
    paymentLog("PAYMENT_FAILED", { paymentId, reason: "Payment not found." })
    return sendJson(res, 404, { status: "failed", error: "Payment not found." })
  }
  if (payment.status !== "waiting") {
    paymentLog("PAYMENT_FAILED", { paymentId, reason: "Payment is not waiting." })
    return sendJson(res, 409, { status: "failed", error: "Payment is not waiting." })
  }
  if (Date.now() > payment.expiresAt) {
    payment.status = "expired"
    paymentLog("PAYMENT_FAILED", { paymentId, reason: "Payment expired." })
    return sendJson(res, 410, { status: "failed", error: "Payment expired." })
  }

  const retryFailure = async (message, statusCode = 400, student = null) => {
    const balanceAfter = student ? Number(student.wallet_balance || 0) : 0
    const attempt = await recordTestingAttempt(payment, {
      uid,
      studentId: student?.student_id || null,
      balanceAfter,
      status: "failed",
      failureReason: message,
    })
    payment.status = "waiting"
    paymentLog("PAYMENT_FAILED", { paymentId, uid, reason: message, retry: true })
    return sendJson(res, statusCode, {
      status: "failed",
      error: message,
      retry: true,
      paymentId,
      studentId: student?.student_id || null,
      balance: balanceAfter,
      attempt,
    })
  }

  const match = await findTestingStudentByUid(uid)
  if (!match?.student) {
    return retryFailure("RFID card is not registered. Tap a registered student card.", 404)
  }

  const student = match.student
  if (student.status !== "active") {
    return retryFailure("Student wallet is inactive. Tap another active card.", 403, student)
  }

  const balanceBefore = Number(student.wallet_balance || 0)
  if (balanceBefore < payment.amount) {
    return retryFailure("Insufficient Balance. Tap another card or add money.", 402, student)
  }

  const balanceAfter = balanceBefore - payment.amount
  const updatedStudent = await updateTestingStudentBalance(match.source, student, balanceAfter)
  const transaction = await recordTestingAttempt(payment, {
    studentId: student.student_id,
    uid,
    status: "success",
    balanceAfter,
  })

  payment.status = "success"
  payment.student = updatedStudent
  payment.transaction = transaction
  paymentLog("PAYMENT_SUCCESS", { paymentId, uid, paid: payment.amount, balance: balanceAfter })

  return sendJson(res, 200, {
    status: "success",
    studentId: updatedStudent.student_id,
    name: updatedStudent.name,
    paid: payment.amount,
    balance: balanceAfter,
    paymentId,
    transaction,
  })
}

async function publicLoginPayload(match) {
  if (match.record?.is_testing || match.record?.isTesting) {
    if (match.role === "student") return { role: "student", user: publicTestingStudent(match.record) }
    if (match.role === "shopkeeper") return { role: "shopkeeper", user: publicTestingShopkeeper() }
  }
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

    if (req.method === "GET" && path === "/api/wallet") {
      const studentId = url.searchParams.get("studentId")
      if (!studentId) return sendJson(res, 400, { error: "studentId is required." })

      const student = await supabase.from("students").select("*").eq("student_id", studentId).maybeSingle()
      throwIfSupabaseError(student.error)
      if (!student.data) return sendJson(res, 404, { error: "Student not found." })

      const wallet = await ensureWallet(student.data)
      sendJson(res, 200, {
        student: publicStudent(student.data),
        wallet: {
          studentId: student.data.student_id,
          balance: Number(wallet.balance || student.data.wallet_balance || 0),
          currency: wallet.currency || "INR",
          updatedAt: wallet.updated_at,
        },
      })
      return
    }

    if (req.method === "GET" && path === "/api/transactions") {
      const studentId = url.searchParams.get("studentId")
      const shopkeeperId = url.searchParams.get("shopkeeperId")
      const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100)
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (studentId) {
        const student = await supabase.from("students").select("id").eq("student_id", studentId).maybeSingle()
        throwIfSupabaseError(student.error)
        if (!student.data) return sendJson(res, 404, { error: "Student not found." })
        query = query.eq("student_id", student.data.id)
      }

      if (shopkeeperId) query = query.eq("shopkeeper_id", shopkeeperId)

      const transactions = await query
      throwIfSupabaseError(transactions.error)
      sendJson(res, 200, { transactions: transactions.data.map(publicTransaction) })
      return
    }

    if (req.method === "GET" && path === "/api/notifications") {
      const role = url.searchParams.get("role")
      const recipientId = url.searchParams.get("recipientId")
      if (!role) return sendJson(res, 400, { error: "role is required." })

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("recipient_role", role)
        .order("created_at", { ascending: false })
        .limit(50)
      if (recipientId) query = query.eq("recipient_id", recipientId)

      const notifications = await query
      throwIfSupabaseError(notifications.error)
      sendJson(res, 200, { notifications: notifications.data })
      return
    }

    if (req.method === "GET" && path === "/api/products") {
      const shopkeeperId = url.searchParams.get("shopkeeperId")
      if (!shopkeeperId) return sendJson(res, 400, { error: "shopkeeperId is required." })

      const products = await supabase
        .from("products")
        .select("*")
        .eq("shopkeeper_id", shopkeeperId)
        .order("created_at", { ascending: false })
      throwIfSupabaseError(products.error)
      sendJson(res, 200, { products: products.data })
      return
    }

    if (req.method === "GET" && path === "/api/testing/students") {
      const students = []
      if (supabase) {
        const result = await supabase
          .from("rfid_test_students")
          .select("*")
          .order("student_id", { ascending: true })
        if (!result.error && result.data?.length) {
          students.push(...result.data.map(publicTestingStudent))
        }
      }
      if (students.length === 0) {
        students.push(...[...testingStudents.values()].map(publicTestingStudent))
      }
      sendJson(res, 200, {
        password: TEST_PASSWORD,
        shop: publicTestingShopkeeper(),
        shopPassword: TEST_SHOP_PASSWORD,
        students,
      })
      return
    }

    if (req.method === "GET" && path === "/api/testing/payments") {
      let transactions = testingTransactions.slice().reverse()
      if (supabase) {
        const result = await supabase
          .from("rfid_test_transactions")
          .select("*")
          .order("created_at", { ascending: false })
        if (!result.error && result.data) transactions = result.data
      }

      const payments = testingPaymentHistory.map((payment) => ({
        paymentId: payment.paymentId,
        deviceId: payment.deviceId,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        expiresAt: payment.expiresAt,
        studentId: payment.student?.student_id || null,
        balance: payment.student?.wallet_balance ?? null,
        attempts: payment.attempts || [],
        lastAttempt: payment.lastAttempt || null,
        lastFailure: payment.lastFailure || null,
      }))

      const successful = transactions.filter((transaction) => transaction.status === "success")
      const failed = transactions.filter((transaction) => transaction.status === "failed")

      sendJson(res, 200, {
        payments,
        transactions,
        stats: {
          totalCollected: successful.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
          successful: successful.length,
          failed: failed.length,
          pending: payments.filter((payment) => payment.status === "waiting").length,
        },
      })
      return
    }

    if (req.method === "GET" && path.startsWith("/api/testing/students/")) {
      const studentId = decodeURIComponent(path.split("/").at(-1) || "")
      const match = await findTestingStudentByStudentId(studentId)
      if (!match?.student) return sendJson(res, 404, { error: "Test student not found." })

      let transactions = testingTransactions
        .filter((transaction) => transaction.student_id === studentId)
        .slice()
        .reverse()

      if (supabase) {
        const result = await supabase
          .from("rfid_test_transactions")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false })
        if (!result.error && result.data) transactions = result.data
      }

      sendJson(res, 200, {
        student: publicTestingStudent(match.student),
        transactions,
      })
      return
    }

    if (req.method === "GET" && path === "/api/devices") {
      const shopkeeperId = url.searchParams.get("shopkeeperId")
      const universityId = url.searchParams.get("universityId")
      let query = supabase
        .from("payment_devices")
        .select("*")
        .order("created_at", { ascending: false })

      if (shopkeeperId) query = query.eq("shopkeeper_id", shopkeeperId)
      if (universityId) query = query.eq("university_id", universityId)

      const devices = await query
      throwIfSupabaseError(devices.error)
      sendJson(res, 200, { devices: devices.data.map(publicDevice) })
      return
    }

    if (req.method === "GET" && path === "/device/status") {
      const deviceId = url.searchParams.get("deviceId")
      if (!deviceId) return sendJson(res, 400, { error: "deviceId is required." })

      if (deviceId === "POS01" || deviceId === "UNI01-POS01") {
        return sendJson(res, 200, {
          device: {
            id: deviceId,
            deviceId,
            status: "online",
            state: "idle",
            mode: "testing",
          },
        })
      }

      const device = await deviceService.deviceStatus(deviceId)
      if (!device) return sendJson(res, 404, { error: "Device not found." })
      sendJson(res, 200, { device })
      return
    }

    if (req.method === "GET" && path === "/payments/status") {
      const paymentId = url.searchParams.get("paymentId") || url.searchParams.get("sessionId")
      if (!paymentId) return sendJson(res, 400, { error: "paymentId is required." })

      const payment = testingPayments.get(paymentId)
      if (payment) {
        return sendJson(res, 200, {
          paymentId,
          status: payment.status,
          amount: payment.amount,
          studentId: payment.student?.student_id || null,
          paid: payment.status === "success" ? payment.amount : null,
          balance: payment.student?.wallet_balance ?? null,
          transaction: payment.transaction || null,
          attempts: payment.attempts || [],
          lastAttempt: payment.lastAttempt || null,
          lastFailure: payment.lastFailure || null,
        })
      }

      sendJson(res, 404, { error: "Payment not found." })
      return
    }

    if (req.method === "GET" && path === "/payments/active") {
      const deviceId = url.searchParams.get("deviceId")
      if (!deviceId) return sendJson(res, 400, { error: "deviceId is required." })

      const activeTestingPayment = [...testingPayments.values()]
        .filter((payment) => payment.deviceId === deviceId && payment.status === "waiting" && payment.expiresAt > Date.now())
        .at(-1)
      if (activeTestingPayment) {
        return sendJson(res, 200, {
          active: true,
          paymentId: activeTestingPayment.paymentId,
          sessionId: activeTestingPayment.paymentId,
          amount: activeTestingPayment.amount,
          status: "waiting",
          attempts: activeTestingPayment.attempts || [],
          lastFailure: activeTestingPayment.lastFailure || null,
          display: {
            title: "UniTap",
            shopName: "Testing POS",
            amount: activeTestingPayment.amount,
            prompt: "Tap Card",
          },
        })
      }

      const device = await supabase
        .from("payment_devices")
        .select("*")
        .eq("device_id", deviceId)
        .maybeSingle()
      throwIfSupabaseError(device.error)
      if (!device.data) return sendJson(res, 404, { error: "Device not found." })

      const session = await supabase
        .from("payment_sessions")
        .select("*, shopkeepers(*)")
        .eq("device_id", device.data.id)
        .eq("status", "waiting-card")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      throwIfSupabaseError(session.error)

      if (!session.data) {
        return sendJson(res, 200, {
          active: false,
          device: publicDevice(device.data),
          display: { state: "Idle" },
        })
      }

      sendJson(res, 200, {
        active: true,
        paymentSessionId: session.data.payment_session_id,
        sessionId: session.data.payment_session_id,
        amount: Number(session.data.amount || 0),
        status: "waiting",
        display: {
          title: "UniTap",
          shopName: session.data.shopkeepers?.shop_name || "Campus Shop",
          amount: Number(session.data.amount || 0),
          prompt: "Tap Card",
        },
        session: publicPaymentSession(session.data),
      })
      return
    }

    if (req.method === "GET" && path === "/api/cards") {
      const studentId = url.searchParams.get("studentId")
      if (!studentId) return sendJson(res, 400, { error: "studentId is required." })

      const student = await supabase.from("students").select("id").eq("student_id", studentId).maybeSingle()
      throwIfSupabaseError(student.error)
      if (!student.data) return sendJson(res, 404, { error: "Student not found." })

      const cards = await supabase
        .from("rfid_cards")
        .select("*")
        .eq("student_id", student.data.id)
        .order("created_at", { ascending: false })
      throwIfSupabaseError(cards.error)
      sendJson(res, 200, { cards: cards.data.map(publicCard) })
      return
    }

    if (req.method === "GET" && path === "/api/analytics") {
      const shopkeeperId = url.searchParams.get("shopkeeperId")
      const studentId = url.searchParams.get("studentId")
      let query = supabase.from("transactions").select("*").eq("status", "success")

      if (shopkeeperId) query = query.eq("shopkeeper_id", shopkeeperId)
      if (studentId) {
        const student = await supabase.from("students").select("id").eq("student_id", studentId).maybeSingle()
        throwIfSupabaseError(student.error)
        if (!student.data) return sendJson(res, 404, { error: "Student not found." })
        query = query.eq("student_id", student.data.id)
      }

      const transactions = await query
      throwIfSupabaseError(transactions.error)
      const totalRevenue = transactions.data.reduce((sum, item) => sum + Number(item.amount || 0), 0)

      const [activeDevices, liveSessions] = await Promise.all([
        supabase
          .from("payment_devices")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("payment_sessions")
          .select("*")
          .in("status", ["waiting-card", "processing"])
          .order("created_at", { ascending: false })
          .limit(20),
      ])
      throwIfSupabaseError(activeDevices.error)
      throwIfSupabaseError(liveSessions.error)

      const oneMinuteAgo = Date.now() - 60_000
      const transactionsPerMinute = transactions.data.filter(
        (item) => new Date(item.created_at).getTime() >= oneMinuteAgo
      ).length
      sendJson(res, 200, {
        totalRevenue,
        transactionCount: transactions.data.length,
        averageTicket: transactions.data.length ? totalRevenue / transactions.data.length : 0,
        activeDevices: activeDevices.count || 0,
        transactionsPerMinute,
        livePayments: liveSessions.data.map(publicPaymentSession),
        recentTransactions: transactions.data
          .slice()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
          .map(publicTransaction),
      })
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
        name: payload.name || null,
        email: payload.email || null,
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

    if (req.method === "POST" && path === "/api/testing/reset") {
      await resetTestingMode()
      sendJson(res, 200, { message: "Testing wallets reset to INR 1000.", students: [...testingStudents.values()].map(publicTestingStudent) })
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

    if (req.method === "POST" && path === "/api/devices/register") {
      const error = requireFields(payload, ["deviceId", "deviceSecret", "shopkeeperId"])
      if (error) return sendJson(res, 400, { error })

      const device = await deviceService.registerDevice(payload)
      await auditLog("university", device.university_id || null, "device.register", "payment_devices", device.id, {
        deviceId: payload.deviceId,
        shopkeeperId: payload.shopkeeperId,
      })
      sendJson(res, 201, { message: "Device registered.", device: publicDevice(device) })
      return
    }

    if (req.method === "POST" && path === "/device/connect") {
      const error = requireFields(payload, ["deviceId", "deviceSecret"])
      if (error) return sendJson(res, 400, { error })

      const connected = await deviceService.connectDevice(payload.deviceId, payload.deviceSecret)
      paymentLog("DEVICE_READY", { deviceId: payload.deviceId })

      sendJson(res, 200, {
        token: connected.token,
        expiresIn: connected.expiresIn,
        device: publicDevice(connected.device),
      })
      return
    }

    if (req.method === "POST" && path === "/device/heartbeat") {
      const token = verifyDeviceToken(bearerToken(req))
      if (!token) return sendJson(res, 401, { error: "Invalid device token." })

      const update = await deviceService.heartbeat(token.sub, payload.state || "idle", payload.metadata || {})
      sendJson(res, 200, { ok: true, device: publicDevice(update) })
      return
    }

    if (req.method === "POST" && path === "/payments/create") {
      const error = requireFields(payload, ["deviceId", "amount"])
      if (error) return sendJson(res, 400, { error })

      const amount = Number(payload.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        return sendJson(res, 400, { error: "Amount must be greater than zero." })
      }

      if (payload.testing === true || !payload.shopId || payload.deviceId === "POS01" || payload.deviceId === "UNI01-POS01") {
        const paymentId = nextTestingPaymentId()
        const payment = {
          paymentId,
          deviceId: payload.deviceId,
          amount,
          status: "waiting",
          expiresAt: Date.now() + 60_000,
          createdAt: new Date().toISOString(),
          attempts: [],
          lastAttempt: null,
          lastFailure: null,
        }
        testingPayments.set(paymentId, payment)
        testingPaymentHistory.unshift(payment)
        paymentLog("PAYMENT_CREATED", { paymentId, deviceId: payload.deviceId, amount, mode: "testing" })
        paymentLog("WAITING_CARD", { paymentId, deviceId: payload.deviceId })

        return sendJson(res, 201, {
          paymentId,
          paymentSessionId: paymentId,
          sessionId: paymentId,
          status: "waiting",
          amount,
          expiresIn: 60,
          display: {
            title: "UniTap",
            shopName: "Testing POS",
            amount,
            prompt: "Tap Card",
          },
        })
      }

      const device = await supabase
        .from("payment_devices")
        .select("*")
        .eq("device_id", payload.deviceId)
        .maybeSingle()
      throwIfSupabaseError(device.error)
      if (!device.data) return sendJson(res, 404, { error: "Device not found." })
      if (device.data.status !== "active") return sendJson(res, 403, { error: "Device is not active." })
      const shopId = payload.shopId || device.data.shopkeeper_id
      if (device.data.shopkeeper_id !== shopId) {
        return sendJson(res, 403, { error: "Device is not assigned to this shop." })
      }

      const shopkeeper = await supabase
        .from("shopkeepers")
        .select("*")
        .eq("id", shopId)
        .maybeSingle()
      throwIfSupabaseError(shopkeeper.error)
      if (!shopkeeper.data) return sendJson(res, 404, { error: "Shop not found." })
      if (shopkeeper.data.status !== "approved") {
        return sendJson(res, 403, { error: "Shop is not approved for payments." })
      }

      const sessionPublicId = paymentSessionId()
      const expiresIn = Math.min(Math.max(Number(payload.expiresIn || 60), 15), 300)
      const session = await supabase
        .from("payment_sessions")
        .insert({
          payment_session_id: sessionPublicId,
          device_id: device.data.id,
          shopkeeper_id: shopkeeper.data.id,
          amount,
          items: sanitizeProducts(payload.items || payload.products),
          status: "waiting-card",
          expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        })
        .select()
        .single()
      throwIfSupabaseError(session.error)

      const updateDevice = await supabase
        .from("payment_devices")
        .update({ state: "tap-card", last_seen: new Date().toISOString() })
        .eq("id", device.data.id)
      throwIfSupabaseError(updateDevice.error)
      paymentLog("PAYMENT_CREATED", {
        deviceId: payload.deviceId,
        paymentSessionId: sessionPublicId,
        amount,
      })
      paymentLog("WAITING_CARD", { deviceId: payload.deviceId, paymentSessionId: sessionPublicId })

      sendJson(res, 201, {
        paymentSessionId: sessionPublicId,
        sessionId: sessionPublicId,
        status: "waiting",
        expiresIn,
        display: {
          title: "UniTap",
          shopName: shopkeeper.data.shop_name,
          amount,
          prompt: "Tap Student Card",
        },
        session: publicPaymentSession(session.data),
      })
      return
    }

    if (req.method === "POST" && path === "/payments/cancel") {
      const sessionId = payload.paymentId || payload.paymentSessionId || payload.sessionId
      if (!sessionId) return sendJson(res, 400, { error: "paymentSessionId or sessionId is required." })

      const testingPayment = testingPayments.get(sessionId)
      if (testingPayment) {
        testingPayment.status = "cancelled"
        paymentLog("PAYMENT_FAILED", { paymentId: sessionId, reason: "Cancelled by cashier." })
        return sendJson(res, 200, {
          message: "Payment session cancelled.",
          status: "cancelled",
          paymentId: sessionId,
        })
      }

      const session = await supabase
        .from("payment_sessions")
        .select("*, payment_devices(*)")
        .eq("payment_session_id", sessionId)
        .maybeSingle()
      throwIfSupabaseError(session.error)
      if (!session.data) return sendJson(res, 404, { error: "Payment session not found." })

      if (!["waiting-card", "processing"].includes(session.data.status)) {
        return sendJson(res, 409, { error: "Payment session can no longer be cancelled." })
      }

      const updateSession = await supabase
        .from("payment_sessions")
        .update({ status: "cancelled", failure_reason: "Cancelled by cashier." })
        .eq("id", session.data.id)
        .select()
        .single()
      throwIfSupabaseError(updateSession.error)

      const updateDevice = await supabase
        .from("payment_devices")
        .update({ state: "idle", last_seen: new Date().toISOString() })
        .eq("id", session.data.device_id)
      throwIfSupabaseError(updateDevice.error)
      paymentLog("PAYMENT_FAILED", { paymentSessionId: sessionId, reason: "Cancelled by cashier." })

      sendJson(res, 200, {
        message: "Payment session cancelled.",
        status: "cancelled",
        session: publicPaymentSession(updateSession.data),
      })
      return
    }

    if (req.method === "POST" && path === "/api/cards/link") {
      const error = requireFields(payload, ["studentId", "uid"])
      if (error) return sendJson(res, 400, { error })

      const normalizedUid = normalizeUid(payload.uid)
      if (!normalizedUid) return sendJson(res, 400, { error: "Invalid RFID UID." })

      const student = await supabase
        .from("students")
        .select("*")
        .eq("student_id", payload.studentId)
        .maybeSingle()
      throwIfSupabaseError(student.error)
      if (!student.data) return sendJson(res, 404, { error: "Student not found." })

      const card = await supabase
        .from("rfid_cards")
        .insert({
          student_id: student.data.id,
          uid_hash: hashUid(normalizedUid),
          uid_last4: uidLast4(normalizedUid),
          label: payload.label || "Student RFID card",
          status: "active",
        })
        .select()
        .single()
      throwIfSupabaseError(card.error)

      const updateStudent = await supabase
        .from("students")
        .update({ card_status: "active" })
        .eq("id", student.data.id)
      throwIfSupabaseError(updateStudent.error)
      await auditLog("university", payload.issuedBy || null, "card.link", "rfid_cards", card.data.id, {
        studentId: payload.studentId,
      })
      sendJson(res, 201, { message: "RFID card linked.", card: publicCard(card.data) })
      return
    }

    if (req.method === "POST" && path === "/api/cards/freeze") {
      const uid = payload.uid ? normalizeUid(payload.uid) : null
      if (!uid && !payload.cardId && !payload.studentId) {
        return sendJson(res, 400, { error: "uid, cardId, or studentId is required." })
      }

      let query = supabase.from("rfid_cards").update({
        status: payload.status || "frozen",
        frozen_at: new Date().toISOString(),
        lost_reported_at: payload.lost ? new Date().toISOString() : null,
      })
      if (payload.cardId) query = query.eq("id", payload.cardId)
      if (uid) query = query.eq("uid_hash", hashUid(uid))
      if (payload.studentId) {
        const student = await supabase.from("students").select("id").eq("student_id", payload.studentId).maybeSingle()
        throwIfSupabaseError(student.error)
        if (!student.data) return sendJson(res, 404, { error: "Student not found." })
        query = query.eq("student_id", student.data.id)
        const updateStudent = await supabase
          .from("students")
          .update({ card_status: payload.status || "frozen" })
          .eq("id", student.data.id)
        throwIfSupabaseError(updateStudent.error)
      }

      const cards = await query.select()
      throwIfSupabaseError(cards.error)
      await auditLog("system", null, "card.freeze", "rfid_cards", payload.cardId || null, {
        reason: payload.reason || "No reason provided",
      })
      sendJson(res, 200, { message: "Card status updated.", cards: cards.data.map(publicCard) })
      return
    }

    if (req.method === "POST" && path === "/api/wallet/topup") {
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

      const balanceBefore = Number(student.data.wallet_balance || 0)
      const balanceAfter = balanceBefore + amount
      const updateStudent = await supabase
        .from("students")
        .update({ wallet_balance: balanceAfter })
        .eq("id", student.data.id)
        .select()
        .single()
      throwIfSupabaseError(updateStudent.error)
      await syncWalletBalance(student.data.id, balanceAfter)

      const transaction = await supabase
        .from("transactions")
        .insert({
          receipt_no: receiptNo("TOP"),
          student_id: student.data.id,
          shopkeeper_id: payload.shopkeeperId || null,
          type: "topup",
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          products: [],
          status: "success",
          metadata: { source: payload.source || "manual", reference: payload.reference || null },
        })
        .select()
        .single()
      throwIfSupabaseError(transaction.error)

      await createNotification(
        "student",
        student.data.id,
        "Wallet topped up",
        `INR ${amount} added to your UniTap wallet.`,
        { transactionId: transaction.data.id }
      )

      sendJson(res, 200, {
        message: "Wallet top-up successful.",
        user: publicStudent(updateStudent.data),
        transaction: publicTransaction(transaction.data),
      })
      return
    }

    if (req.method === "POST" && path === "/payments/confirm") {
      const sessionId = payload.paymentId || payload.paymentSessionId || payload.sessionId
      if (!sessionId || !payload.uid) {
        return sendJson(res, 400, { status: "failed", error: "paymentId/paymentSessionId/sessionId and uid are required." })
      }

      if (payload.paymentId || testingPayments.has(sessionId)) {
        return handleTestingPaymentConfirm(res, { ...payload, paymentId: sessionId })
      }

      const tokenValue = bearerToken(req)
      const token = tokenValue ? verifyDeviceToken(tokenValue) : null
      if (tokenValue && !token) return sendJson(res, 401, { status: "failed", error: "Invalid device token." })

      const session = await supabase
        .from("payment_sessions")
        .select("*, payment_devices(*), shopkeepers(*)")
        .eq("payment_session_id", sessionId)
        .maybeSingle()
      throwIfSupabaseError(session.error)
      if (!session.data) return sendJson(res, 404, { status: "failed", error: "Payment session not found." })
      if (token && session.data.device_id !== token.sub) {
        return sendJson(res, 403, { status: "failed", error: "Payment session does not belong to this device." })
      }
      if (session.data.status === "success") {
        return sendJson(res, 409, { status: "failed", error: "Payment session is already confirmed." })
      }
      if (new Date(session.data.expires_at).getTime() < Date.now()) {
        const expired = await supabase
          .from("payment_sessions")
          .update({ status: "expired", failure_reason: "Payment session expired." })
          .eq("id", session.data.id)
        throwIfSupabaseError(expired.error)
        return sendJson(res, 410, { status: "failed", error: "Payment session expired." })
      }

      const processing = await supabase
        .from("payment_sessions")
        .update({ status: "processing" })
        .eq("id", session.data.id)
        .eq("status", "waiting-card")
        .select()
        .maybeSingle()
      throwIfSupabaseError(processing.error)
      if (!processing.data) {
        return sendJson(res, 409, { status: "failed", error: "Payment session is already being processed." })
      }

      const uid = normalizeUid(payload.uid)
      paymentLog("CARD_DETECTED", {
        paymentSessionId: session.data.payment_session_id,
        uidLast4: uidLast4(uid),
      })
      const card = await supabase
        .from("rfid_cards")
        .select("*, students(*)")
        .eq("uid_hash", hashUid(uid))
        .maybeSingle()
      throwIfSupabaseError(card.error)

      const failSession = async (message, statusCode = 400) => {
        paymentLog("PAYMENT_FAILED", {
          paymentSessionId: session.data.payment_session_id,
          reason: message,
        })
        const failed = await supabase
          .from("payment_sessions")
          .update({ status: "failed", failure_reason: message })
          .eq("id", session.data.id)
        throwIfSupabaseError(failed.error)
        const deviceFailed = await supabase
          .from("payment_devices")
          .update({ state: "failed", last_seen: new Date().toISOString() })
          .eq("id", session.data.device_id)
        throwIfSupabaseError(deviceFailed.error)
        return sendJson(res, statusCode, { status: "failed", error: message })
      }

      if (!uid || !card.data) return failSession("RFID card not found.", 404)
      if (card.data.status !== "active") return failSession("RFID card is not active.", 403)

      const student = card.data.students
      if (!student || student.status !== "active" || student.card_status === "frozen") {
        return failSession("Student wallet is not active.", 403)
      }

      const amount = Number(session.data.amount || 0)
      const balanceBefore = Number(student.wallet_balance || 0)
      if (balanceBefore < amount) {
        const failedTransaction = await supabase
          .from("transactions")
          .insert({
            receipt_no: receiptNo("FAIL"),
            student_id: student.id,
            shopkeeper_id: session.data.shopkeeper_id,
            card_id: card.data.id,
            device_id: session.data.device_id,
            payment_session_id: session.data.id,
            type: "purchase",
            amount,
            balance_before: balanceBefore,
            balance_after: balanceBefore,
            products: session.data.items || [],
            status: "failed",
            failure_reason: "Insufficient wallet balance",
            metadata: { uidLast4: card.data.uid_last4, paymentSessionId: session.data.payment_session_id },
          })
          .select()
          .single()
        throwIfSupabaseError(failedTransaction.error)
        return failSession("Insufficient wallet balance.", 402)
      }

      const balanceAfter = balanceBefore - amount
      const updateStudent = await supabase
        .from("students")
        .update({ wallet_balance: balanceAfter })
        .eq("id", student.id)
        .select()
        .single()
      throwIfSupabaseError(updateStudent.error)
      await syncWalletBalance(student.id, balanceAfter)

      const transaction = await supabase
        .from("transactions")
        .insert({
          receipt_no: receiptNo("PAY"),
          student_id: student.id,
          shopkeeper_id: session.data.shopkeeper_id,
          card_id: card.data.id,
          device_id: session.data.device_id,
          payment_session_id: session.data.id,
          type: "purchase",
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          products: session.data.items || [],
          status: "success",
          metadata: {
            uidLast4: card.data.uid_last4,
            paymentSessionId: session.data.payment_session_id,
            devicePublicId: session.data.payment_devices?.device_id,
          },
        })
        .select()
        .single()
      throwIfSupabaseError(transaction.error)

      const updateSession = await supabase
        .from("payment_sessions")
        .update({
          status: "success",
          confirmed_at: new Date().toISOString(),
          transaction_id: transaction.data.id,
        })
        .eq("id", session.data.id)
      throwIfSupabaseError(updateSession.error)
      const updateDevice = await supabase
        .from("payment_devices")
        .update({ state: "approved", last_seen: new Date().toISOString() })
        .eq("id", session.data.device_id)
      throwIfSupabaseError(updateDevice.error)

      await Promise.all([
        createNotification(
          "student",
          student.id,
          "Payment successful",
          `INR ${amount} spent at ${session.data.shopkeepers?.shop_name || "campus shop"}.`,
          { transactionId: transaction.data.id, paymentSessionId: session.data.payment_session_id }
        ),
        createNotification(
          "shopkeeper",
          session.data.shopkeeper_id,
          "Payment received",
          `INR ${amount} received from ${student.student_id}.`,
          { transactionId: transaction.data.id, paymentSessionId: session.data.payment_session_id }
        ),
        auditLog("payment-device", session.data.device_id, "payment.confirm", "transactions", transaction.data.id, {
          amount,
          uidLast4: card.data.uid_last4,
          paymentSessionId: session.data.payment_session_id,
        }),
      ])
      paymentLog("PAYMENT_SUCCESS", {
        paymentSessionId: session.data.payment_session_id,
        amount,
        balance: balanceAfter,
      })

      sendJson(res, 200, {
        status: "success",
        amount,
        balance: balanceAfter,
        remainingBalance: balanceAfter,
        receiptNo: transaction.data.receipt_no,
        transaction: publicTransaction(transaction.data),
        student: publicStudent(updateStudent.data),
      })
      return
    }

    if (req.method === "POST" && (path === "/payments/pay" || path === "/api/payments/pay")) {
      const error = requireFields(payload, ["uid", "merchantId", "amount"])
      if (error) return sendJson(res, 400, { error })

      const uid = normalizeUid(payload.uid)
      const amount = Number(payload.amount)
      const products = sanitizeProducts(payload.products)
      const cartTotal = productTotal(products)
      const finalAmount = Number.isFinite(amount) && amount > 0 ? amount : cartTotal
      if (!uid) return sendJson(res, 400, { status: "failed", error: "Invalid RFID UID." })
      if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
        return sendJson(res, 400, { status: "failed", error: "Amount must be greater than zero." })
      }

      const card = await supabase
        .from("rfid_cards")
        .select("*, students(*)")
        .eq("uid_hash", hashUid(uid))
        .maybeSingle()
      throwIfSupabaseError(card.error)
      if (!card.data) return sendJson(res, 404, { status: "failed", error: "RFID card not found." })
      if (card.data.status !== "active") {
        return sendJson(res, 403, { status: "failed", error: "RFID card is not active." })
      }

      const student = card.data.students
      if (!student || student.status !== "active" || student.card_status === "frozen") {
        return sendJson(res, 403, { status: "failed", error: "Student wallet is not active." })
      }

      const shopkeeper = await supabase
        .from("shopkeepers")
        .select("*")
        .eq("id", payload.merchantId)
        .maybeSingle()
      throwIfSupabaseError(shopkeeper.error)
      if (!shopkeeper.data) return sendJson(res, 404, { status: "failed", error: "Merchant not found." })
      if (shopkeeper.data.status !== "approved") {
        return sendJson(res, 403, { status: "failed", error: "Merchant is not approved." })
      }

      const balanceBefore = Number(student.wallet_balance || 0)
      if (balanceBefore < finalAmount) {
        const failed = await supabase
          .from("transactions")
          .insert({
            receipt_no: receiptNo("FAIL"),
            student_id: student.id,
            shopkeeper_id: shopkeeper.data.id,
            card_id: card.data.id,
            type: "purchase",
            amount: finalAmount,
            balance_before: balanceBefore,
            balance_after: balanceBefore,
            products,
            status: "failed",
            failure_reason: "Insufficient wallet balance",
            metadata: { uidLast4: card.data.uid_last4 },
          })
          .select()
          .single()
        throwIfSupabaseError(failed.error)
        return sendJson(res, 402, {
          status: "failed",
          error: "Insufficient wallet balance.",
          remainingBalance: balanceBefore,
          transaction: publicTransaction(failed.data),
        })
      }

      const balanceAfter = balanceBefore - finalAmount
      const updateStudent = await supabase
        .from("students")
        .update({ wallet_balance: balanceAfter })
        .eq("id", student.id)
        .select()
        .single()
      throwIfSupabaseError(updateStudent.error)
      await syncWalletBalance(student.id, balanceAfter)

      const transaction = await supabase
        .from("transactions")
        .insert({
          receipt_no: receiptNo("PAY"),
          student_id: student.id,
          shopkeeper_id: shopkeeper.data.id,
          card_id: card.data.id,
          type: "purchase",
          amount: finalAmount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          products,
          status: "success",
          metadata: { uidLast4: card.data.uid_last4, deviceId: payload.deviceId || null },
        })
        .select()
        .single()
      throwIfSupabaseError(transaction.error)

      await Promise.all([
        createNotification(
          "student",
          student.id,
          "Payment successful",
          `INR ${finalAmount} spent at ${shopkeeper.data.shop_name}.`,
          { transactionId: transaction.data.id, merchantId: shopkeeper.data.id }
        ),
        createNotification(
          "shopkeeper",
          shopkeeper.data.id,
          "Payment received",
          `INR ${finalAmount} received from ${student.student_id}.`,
          { transactionId: transaction.data.id }
        ),
        auditLog("rfid-device", shopkeeper.data.id, "payment.rfid", "transactions", transaction.data.id, {
          amount: finalAmount,
          uidLast4: card.data.uid_last4,
        }),
      ])

      sendJson(res, 200, {
        status: "success",
        message: "Payment successful.",
        remainingBalance: balanceAfter,
        receiptNo: transaction.data.receipt_no,
        transaction: publicTransaction(transaction.data),
        student: publicStudent(updateStudent.data),
      })
      return
    }

    if (req.method === "POST" && path === "/api/products/upsert") {
      const error = requireFields(payload, ["shopkeeperId", "name", "price"])
      if (error) return sendJson(res, 400, { error })

      const product = {
        id: payload.productId || undefined,
        shopkeeper_id: payload.shopkeeperId,
        name: payload.name,
        price: Number(payload.price),
        sku: payload.sku || null,
        category: payload.category || null,
        stock_qty: Number(payload.stockQty || 0),
        low_stock_threshold: Number(payload.lowStockThreshold || 5),
        is_active: payload.isActive !== false,
      }
      const result = await supabase.from("products").upsert(product).select().single()
      throwIfSupabaseError(result.error)
      sendJson(res, 200, { message: "Product saved.", product: result.data })
      return
    }

    if (req.method === "POST" && path === "/api/products/delete") {
      const error = requireFields(payload, ["productId"])
      if (error) return sendJson(res, 400, { error })

      const result = await supabase.from("products").delete().eq("id", payload.productId)
      throwIfSupabaseError(result.error)
      sendJson(res, 200, { message: "Product deleted." })
      return
    }

    if (req.method === "POST" && path === "/api/refunds") {
      const error = requireFields(payload, ["transactionId", "amount"])
      if (error) return sendJson(res, 400, { error })

      const amount = Number(payload.amount)
      const original = await supabase
        .from("transactions")
        .select("*")
        .eq("id", payload.transactionId)
        .eq("status", "success")
        .single()
      throwIfSupabaseError(original.error)
      if (amount <= 0 || amount > Number(original.data.amount)) {
        return sendJson(res, 400, { error: "Invalid refund amount." })
      }

      const student = await supabase.from("students").select("*").eq("id", original.data.student_id).single()
      throwIfSupabaseError(student.error)
      const balanceBefore = Number(student.data.wallet_balance || 0)
      const balanceAfter = balanceBefore + amount
      const updateStudent = await supabase
        .from("students")
        .update({ wallet_balance: balanceAfter })
        .eq("id", student.data.id)
        .select()
        .single()
      throwIfSupabaseError(updateStudent.error)
      await syncWalletBalance(student.data.id, balanceAfter)

      const refund = await supabase
        .from("refunds")
        .insert({
          transaction_id: original.data.id,
          amount,
          reason: payload.reason || "Refund processed by merchant.",
        })
        .select()
        .single()
      throwIfSupabaseError(refund.error)

      sendJson(res, 200, {
        message: "Refund processed.",
        refund: refund.data,
        student: publicStudent(updateStudent.data),
      })
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
      await syncWalletBalance(student.data.id, newBalance)

      const updateTopup = await supabase
        .from("wallet_topups")
        .update({
          status: "paid",
          razorpay_payment_id: payload.razorpayPaymentId,
          razorpay_signature: payload.razorpaySignature,
        })
        .eq("id", topup.data.id)
      throwIfSupabaseError(updateTopup.error)

      const transaction = await supabase
        .from("transactions")
        .insert({
          receipt_no: receiptNo("TOP"),
          student_id: student.data.id,
          type: "topup",
          amount: Number(topup.data.amount),
          balance_before: Number(student.data.wallet_balance || 0),
          balance_after: newBalance,
          products: [],
          status: "success",
          metadata: {
            source: "razorpay",
            razorpayOrderId: payload.razorpayOrderId,
            razorpayPaymentId: payload.razorpayPaymentId,
          },
        })
        .select()
        .single()
      throwIfSupabaseError(transaction.error)
      await createNotification(
        "student",
        student.data.id,
        "Wallet topped up",
        `INR ${topup.data.amount} added to your UniTap wallet.`,
        { transactionId: transaction.data.id }
      )

      sendJson(res, 200, {
        message: "Wallet top-up successful.",
        user: publicStudent(updateStudent.data),
        transaction: publicTransaction(transaction.data),
      })
      return
    }

    sendJson(res, 404, { error: "Route not found." })
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: error.message || "Unexpected server error." })
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
