"use client"

import * as React from "react"
import {
  ArrowRight,
  Ban,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CirclePause,
  Clock3,
  GraduationCap,
  Landmark,
  Layers3,
  LockKeyhole,
  Menu,
  Quote,
  Radio,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  WalletCards,
  X,
  Zap,
} from "lucide-react"

type Role = "student" | "shopkeeper" | "university" | "superAdmin"
type AuthMode = "login" | "signup" | "reset"

type Session = {
  role: Role
  message: string
  user?: Record<string, unknown>
  overview?: SuperAdminOverview
}

type Shop = {
  id: string
  shopName: string
  location: string
  email: string
  phone: string
  universityRegistrationId: string
  status: string
  products: Array<{ id: string; name: string; price: number }>
}

type SuperAdminOverview = {
  totals: {
    universities: number
    shopkeepers: number
    students: number
    canteens: number
    logins: number
    signups: number
  }
  universities: Array<{
    id: string
    name: string
    officialEmail: string
    registrationId: string
    status: string
    canteens: number
    pendingShops: number
    bannedShops: number
  }>
  recentLogins: Array<{ id: string; role: string; identifier: string; at: string }>
  recentSignups: Array<{ id: string; role: string; identifier: string; at: string }>
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const API_BASE = "http://localhost:4000"

const roleOptions: Array<{
  id: Role
  label: string
  description: string
  icon: React.ElementType
}> = [
  {
    id: "student",
    label: "Student",
    description: "Student ID wallet, top-ups, bills, receipts, and reset with DOB.",
    icon: GraduationCap,
  },
  {
    id: "shopkeeper",
    label: "Shopkeeper",
    description: "Signup with shop details, add products, then wait for university approval.",
    icon: Store,
  },
  {
    id: "university",
    label: "University Head",
    description: "Official university account, shop approvals, bans, and campus control.",
    icon: Building2,
  },
  {
    id: "superAdmin",
    label: "Super Admin",
    description: "Platform overview, universities, canteens, login and signup activity.",
    icon: ShieldCheck,
  },
]

const campusStats = [
  { value: "0.4s", label: "RFID authorization", tone: "from-blue-600 to-cyan-400" },
  { value: "4", label: "role dashboards", tone: "from-teal-500 to-emerald-400" },
  { value: "100%", label: "cashless audit trail", tone: "from-orange-500 to-amber-300" },
  { value: "Live", label: "wallet + vendor data", tone: "from-violet-600 to-blue-400" },
]

const campusFlow = [
  {
    title: "Student taps ID card",
    description: "RFID verifies wallet balance, student identity, and transaction context instantly.",
    icon: Radio,
  },
  {
    title: "Shop receives payment",
    description: "The canteen counter sees paid status, order amount, product data, and inventory impact.",
    icon: ReceiptText,
  },
  {
    title: "University sees everything",
    description: "Campus heads monitor shops, approvals, bans, settlements, and spending patterns.",
    icon: Landmark,
  },
]

const marqueeItems = [
  "RFID Tap-to-Pay",
  "Campus Wallets",
  "Live Analytics",
  "Vendor Approvals",
  "Razorpay Top-Ups",
  "Fraud Monitoring",
  "Multi-Canteen Ops",
  "Student Receipts",
]

const bentoFeatures = [
  {
    title: "Instant RFID checkout",
    description: "Students tap once. Balance, identity, and receipt are handled in under half a second.",
    icon: Radio,
    className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 text-white",
    large: true,
  },
  {
    title: "Razorpay wallet recharge",
    description: "Top up from the student dashboard with verified payment signatures.",
    icon: WalletCards,
    className: "bg-white/80 dark:bg-white/10",
  },
  {
    title: "University moderation",
    description: "Approve, pause, or ban campus shops from one control panel.",
    icon: ShieldCheck,
    className: "bg-white/80 dark:bg-white/10",
  },
  {
    title: "Secure by design",
    description: "Hashed passwords, role-safe login, and Supabase-backed records.",
    icon: LockKeyhole,
    className: "bg-slate-950 text-white",
  },
  {
    title: "Shopkeeper product menus",
    description: "Register items and prices at signup or add them later after approval.",
    icon: ShoppingBag,
    className: "md:col-span-2 bg-white/80 dark:bg-white/10",
  },
]

const testimonials = [
  {
    quote: "Queues at the canteen dropped immediately. Students love how fast the tap feels.",
    name: "Priya Sharma",
    role: "Student Council Lead",
    stars: 5,
  },
  {
    quote: "We finally have one place to approve vendors, watch sales, and stop risky shops.",
    name: "Dr. Riya Menon",
    role: "University Operations",
    stars: 5,
  },
  {
    quote: "Checkout is smoother and our daily settlement view is crystal clear.",
    name: "Rahul Verma",
    role: "Uni Cafe Owner",
    stars: 5,
  },
]

const faqs = [
  {
    q: "Can students use any university ID card?",
    a: "UniTap is built for RFID-enabled campus cards. Universities can onboard students with wallet profiles tied to their student ID.",
  },
  {
    q: "What happens if someone logs in on the wrong role tab?",
    a: "Universal login detects the real account type automatically and routes users to the correct dashboard.",
  },
  {
    q: "How do shopkeepers get approved?",
    a: "After signup, the university head reviews the shop, can approve it, temporarily stop it, or ban it from campus operations.",
  },
  {
    q: "Are wallet top-ups real payments?",
    a: "Yes. Student top-ups create Razorpay orders and credit the wallet only after signature verification on the backend.",
  },
]

const rolePreviewContent: Record<
  Role,
  { headline: string; metrics: Array<[string, string]>; accent: string }
> = {
  student: {
    headline: "Wallet-first student experience",
    metrics: [
      ["Balance", "₹2,480"],
      ["This week", "₹820 spent"],
      ["Top-up", "Razorpay ready"],
      ["Card", "RFID active"],
    ],
    accent: "from-blue-600 to-cyan-400",
  },
  shopkeeper: {
    headline: "Counter built for speed",
    metrics: [
      ["Today", "₹38,460"],
      ["Orders", "314"],
      ["Peak", "1–2 PM"],
      ["Stock", "7 low items"],
    ],
    accent: "from-teal-500 to-emerald-400",
  },
  university: {
    headline: "Campus command center",
    metrics: [
      ["Students", "18,420"],
      ["Shops", "24 active"],
      ["Pending", "3 approvals"],
      ["Alerts", "2 flagged"],
    ],
    accent: "from-violet-600 to-indigo-400",
  },
  superAdmin: {
    headline: "Platform-wide visibility",
    metrics: [
      ["Universities", "42"],
      ["Canteens", "186"],
      ["Logins today", "1,204"],
      ["Health", "99.98%"],
    ],
    accent: "from-orange-500 to-rose-400",
  },
}

const initialForm = {
  loginIdentifier: "",
  studentId: "",
  studentUniversityName: "",
  studentCity: "",
  studentState: "",
  studentCountry: "",
  dob: "",
  password: "",
  newPassword: "",
  name: "",
  address: "",
  officialEmail: "",
  phone: "",
  website: "",
  registrationId: "",
  shopName: "",
  location: "",
  email: "",
  identifier: "",
  products: "",
  skipProducts: false,
  topupAmount: "500",
}

export function UniTapApp() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [authOpen, setAuthOpen] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<AuthMode>("login")
  const [role, setRole] = React.useState<Role>("student")
  const [form, setForm] = React.useState(initialForm)
  const [status, setStatus] = React.useState("Choose a role and continue.")
  const [session, setSession] = React.useState<Session | null>(null)
  const [shops, setShops] = React.useState<Shop[]>([])
  const [loading, setLoading] = React.useState(false)
  const [previewRole, setPreviewRole] = React.useState<Role>("student")

  const openAuth = (mode: AuthMode, nextRole: Role = role) => {
    setRole(nextRole)
    setAuthMode(mode)
    setAuthOpen(true)
    setStatus(mode === "reset" ? "Reset student password using Student ID and DOB." : "Choose a role and continue.")
  }

  const updateForm = (key: keyof typeof initialForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const submitJson = async (path: string, payload: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Request failed.")
    }
    return data
  }

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setStatus("Connecting to UniTap backend...")

    try {
      if (authMode === "reset") {
        const data = await submitJson("/api/student/reset-password", {
          studentId: form.studentId,
          dob: form.dob,
          newPassword: form.newPassword,
        })
        setStatus(data.message)
        setAuthMode("login")
        setForm((current) => ({ ...current, password: current.newPassword, newPassword: "" }))
        return
      }

      if (authMode === "signup") {
        await handleSignup()
        return
      }

      await handleLogin()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (role === "student") {
      const data = await submitJson("/api/student/signup", {
        studentId: form.studentId,
        universityName: form.studentUniversityName,
        city: form.studentCity,
        state: form.studentState,
        country: form.studentCountry,
        dob: form.dob,
        password: form.password,
      })
      setSession({ role, message: data.message, user: data.user })
      setStatus(data.message)
    }

    if (role === "university") {
      const data = await submitJson("/api/university/signup", {
        name: form.name,
        address: form.address,
        officialEmail: form.officialEmail,
        phone: form.phone,
        website: form.website,
        registrationId: form.registrationId,
        password: form.password,
      })
      setSession({ role, message: data.message, user: data.user })
      setStatus(data.message)
    }

    if (role === "shopkeeper") {
      const data = await submitJson("/api/shopkeeper/signup", {
        shopName: form.shopName,
        location: form.location,
        email: form.email,
        phone: form.phone,
        universityRegistrationId: form.registrationId,
        password: form.password,
        products: form.skipProducts ? [] : parseProducts(form.products),
      })
      setSession({ role, message: data.message, user: data.user })
      setStatus(data.message)
    }

    if (role === "superAdmin") {
      setStatus("Super admin signup is disabled. Use the platform admin configured in backend/.env or Supabase.")
      return
    }

    setAuthOpen(false)
  }

  const handleLogin = async () => {
    const data = await submitJson("/api/auth/login", {
      identifier: form.loginIdentifier,
      password: form.password,
    })

    setRole(data.role)

    if (data.role === "university") {
      await loadUniversityShops(data.user.registrationId)
    }

    setSession({ role: data.role, message: data.message, user: data.user, overview: data.overview })
    setStatus(data.message)
    setAuthOpen(false)
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const loadUniversityShops = async (registrationId: string) => {
    const response = await fetch(`${API_BASE}/api/university/${encodeURIComponent(registrationId)}/shops`)
    const data = await response.json()
    setShops(data.shops || [])
  }

  const moderateShop = async (shopId: string, action: "approve" | "ban" | "suspend" | "activate") => {
    const data = await submitJson(`/api/university/shops/${shopId}/${action}`, {})
    setStatus(data.message)
    const registrationId = session?.user?.registrationId
    if (typeof registrationId === "string") {
      await loadUniversityShops(registrationId)
    }
  }

  const handleWalletTopup = async () => {
    if (session?.role !== "student" || typeof session.user?.studentId !== "string") return

    setLoading(true)
    setStatus("Creating Razorpay order...")

    try {
      await loadRazorpay()
      const order = await submitJson("/api/wallet/topup/order", {
        studentId: session.user.studentId,
        amount: Number(form.topupAmount),
      })

      const RazorpayCheckout = window.Razorpay
      if (!RazorpayCheckout) throw new Error("Razorpay checkout failed to load.")

      const checkout = new RazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "UniTap Wallet",
        description: "Student wallet top-up",
        order_id: order.orderId,
        handler: async (payment: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          const verified = await submitJson("/api/wallet/topup/verify", {
            studentId: session.user?.studentId,
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
          })

          setSession((current) =>
            current ? { ...current, message: verified.message, user: verified.user } : current
          )
          setStatus(verified.message)
        },
        theme: { color: "#2563eb" },
      })

      checkout.open()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create top-up order.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#eaf4ff_0,#f7fbff_34%,#f8fbff_100%)] text-slate-950 transition-colors duration-500 dark:bg-slate-950 dark:text-white">
      <LandingBackdrop />
      <Header
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((value) => !value)}
        onOpenAuth={openAuth}
      />

      <section id="home" className="relative px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 mesh-grid opacity-80" />
        <div className="pointer-events-none absolute left-[-14rem] top-[-12rem] h-[34rem] w-[34rem] animate-float rounded-full bg-blue-300/40 blur-3xl dark:bg-blue-500/20" />
        <div className="pointer-events-none absolute right-[-14rem] top-10 h-[34rem] w-[34rem] animate-float-slow rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-500/20" />
        <div className="pointer-events-none absolute bottom-[-12rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-orange-200/70 blur-3xl dark:bg-orange-500/10" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(440px,0.9fr)] xl:gap-14">
          <RevealSection>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-black text-blue-700 shadow-sm backdrop-blur dark:border-blue-400/30 dark:bg-white/10 dark:text-blue-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-teal-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              <Sparkles className="h-4 w-4 text-orange-500" />
              Cashless campus operating system
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl xl:text-7xl">
              A faster, smarter payment layer for{" "}
              <span className="bg-gradient-to-r from-blue-700 via-teal-500 to-orange-400 bg-clip-text text-transparent animate-shimmer-text">
                every campus tap
              </span>
              .
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              UniTap turns student ID cards into secure wallets, gives shopkeepers a beautiful checkout flow, and gives university heads a live command center for approvals, bans, analytics, and settlements.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openAuth("signup", "university")}
                className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-teal-500 px-7 py-4 text-sm font-black text-white shadow-2xl shadow-blue-600/25 transition hover:-translate-y-1 animate-gradient-bg"
              >
                Launch Your Campus
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => openAuth("login", "student")}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-black text-slate-800 shadow-lg transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                Student Login
              </button>
              <a href="#preview" className="inline-flex items-center justify-center rounded-full border border-transparent px-4 py-4 text-sm font-black text-blue-700 underline-offset-4 hover:underline dark:text-teal-200">
                Preview dashboards
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {campusStats.map((stat) => (
                <div key={stat.label} className="group rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/10">
                  <div className={`inline-flex rounded-full bg-gradient-to-r ${stat.tone} bg-clip-text text-2xl font-black text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </RevealSection>
          <div className="mx-auto w-full max-w-[560px] animate-float-slow lg:mx-0">
            <HeroCard />
          </div>
        </div>
      </section>

      <MarqueeSection items={marqueeItems} />

      <section id="experience" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2.75rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 dark:border-white/10 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-teal-200">
              <Zap className="h-4 w-4 text-orange-300" />
              One tap journey
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.04em] sm:text-5xl">From queue to verified payment in seconds.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The product feels simple for students, fast for counters, and deeply accountable for administrators.
            </p>
          </div>
          <div className="grid gap-4">
            {campusFlow.map((item, index) => (
              <div key={item.title} className="group flex gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 transition hover:-translate-y-1 hover:bg-white/[0.11]">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 text-white shadow-lg shadow-teal-500/20">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">Step {index + 1}</div>
                  <h3 className="mt-1 text-xl font-black">{item.title}</h3>
                  <p className="mt-2 leading-7 text-slate-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform"
          title="Purpose-built workspaces, not generic portals"
          description="Each role gets the right controls, the right context, and a direct route into the backend workflow."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {roleOptions.map((item) => (
            <RoleCard key={item.id} {...item} onLogin={() => openAuth("login", item.id)} onSignup={() => openAuth("signup", item.id)} />
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 p-8 text-white shadow-2xl shadow-blue-700/20">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
              <Layers3 className="h-4 w-4" />
              Product depth
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.04em]">Designed to feel light, built to run serious campus money.</h2>
            <p className="mt-5 leading-8 text-blue-50">
              UniTap keeps the student flow joyful while giving operators the hard controls they actually need: moderation, auditability, wallet accounting, and payment verification.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
          {[
            ["Student security", "Student signup captures university, city, state, country, ID, DOB, and password. Reset still requires DOB.", GraduationCap],
            ["University control", "University heads can approve, ban, temporarily stop, or reactivate campus shops.", Landmark],
            ["Shop operations", "Shopkeepers register locations, add products and prices, then wait for campus approval.", ShoppingBag],
            ["Platform overview", "Super admin can view total universities, canteens, students, logins, and signups.", TrendingUp],
          ].map(([title, description, Icon]) => (
            <article key={title} className="rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-sm dark:border-white/10 dark:bg-white/10">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{description}</p>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Capabilities"
          title="A bento grid of campus-grade infrastructure"
          description="Every block maps to a real backend flow — wallets, vendors, moderation, and platform health."
        />
        <BentoGrid features={bentoFeatures} />
      </section>

      <section id="preview" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Live preview"
          title="Switch dashboards before you sign in"
          description="Explore how each role experiences UniTap — then log in to open your real workspace below."
        />
        <RolePreviewSection
          previewRole={previewRole}
          onOpenAuth={openAuth}
          onRoleChange={setPreviewRole}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Proof"
          title="Built for people who run real campuses"
          description="Operators, students, and vendors all feel the same thing: less friction, more control."
        />
        <TestimonialsSection items={testimonials} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Answers before your rollout meeting"
          description="The essentials for IT, finance, and campus operations teams."
        />
        <FaqSection items={faqs} />
      </section>

      <CtaBand onOpenAuth={openAuth} />

      <section id="workspace" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Workspace
          form={form}
          loading={loading}
          session={session}
          shops={shops}
          status={status}
          onOpenAuth={openAuth}
          onModerateShop={moderateShop}
          onTopup={handleWalletTopup}
          onUpdate={updateForm}
        />
      </section>

      <Footer onOpenAuth={openAuth} />

      {authOpen && (
        <AuthModal
          authMode={authMode}
          form={form}
          loading={loading}
          role={role}
          status={status}
          onClose={() => setAuthOpen(false)}
          onModeChange={setAuthMode}
          onRoleChange={setRole}
          onSubmit={handleAuthSubmit}
          onUpdate={updateForm}
        />
      )}
    </main>
  )
}

function Header({
  isMenuOpen,
  onMenuToggle,
  onOpenAuth,
}: {
  isMenuOpen: boolean
  onMenuToggle: () => void
  onOpenAuth: (mode: AuthMode, role?: Role) => void
}) {
  return (
    <header className="sticky top-0 z-50 px-3 py-3">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/85 px-4 py-3 shadow-lg shadow-blue-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/75 sm:px-5">
        <a href="#home" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-teal-500 to-orange-400 text-white shadow-lg shadow-blue-500/25">
            <Radio className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight">UniTap</span>
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Smart Campus Pay</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 rounded-full bg-slate-100/70 p-1 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300 lg:flex">
          <a href="#platform" className="rounded-full px-4 py-2 transition hover:bg-white hover:text-blue-600 dark:hover:bg-white/10">Platform</a>
          <a href="#preview" className="rounded-full px-4 py-2 transition hover:bg-white hover:text-blue-600 dark:hover:bg-white/10">Preview</a>
          <a href="#features" className="rounded-full px-4 py-2 transition hover:bg-white hover:text-blue-600 dark:hover:bg-white/10">Features</a>
          <a href="#workspace" className="rounded-full px-4 py-2 transition hover:bg-white hover:text-blue-600 dark:hover:bg-white/10">Dashboard</a>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button type="button" onClick={() => onOpenAuth("login", "student")} className="rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white">
            Login
          </button>
          <button type="button" onClick={() => onOpenAuth("signup", "student")} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-white dark:text-slate-950">
            Sign Up
          </button>
        </div>

        <button type="button" onClick={onMenuToggle} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white lg:hidden dark:border-white/10 dark:bg-white/10" aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[1.75rem] border border-white/70 bg-white px-4 py-4 shadow-xl dark:border-white/10 dark:bg-slate-950 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-3 text-sm font-semibold">
            <button type="button" onClick={() => onOpenAuth("login", "student")} className="rounded-2xl bg-blue-50 px-4 py-3 text-left text-blue-700">Login</button>
            <button type="button" onClick={() => onOpenAuth("signup", "student")} className="rounded-2xl bg-slate-950 px-4 py-3 text-left text-white">Sign Up</button>
            <a href="#platform" className="rounded-2xl px-4 py-3 text-slate-600 dark:text-slate-300">Platform</a>
            <a href="#preview" className="rounded-2xl px-4 py-3 text-slate-600 dark:text-slate-300">Preview</a>
            <a href="#features" className="rounded-2xl px-4 py-3 text-slate-600 dark:text-slate-300">Features</a>
          </div>
        </div>
      )}
    </header>
  )
}

function AuthModal({
  authMode,
  form,
  loading,
  role,
  status,
  onClose,
  onModeChange,
  onRoleChange,
  onSubmit,
  onUpdate,
}: {
  authMode: AuthMode
  form: typeof initialForm
  loading: boolean
  role: Role
  status: string
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
  onRoleChange: (role: Role) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onUpdate: (key: keyof typeof initialForm, value: string | boolean) => void
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 p-4 backdrop-blur">
      <div className="mx-auto my-8 max-w-5xl rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">UniTap Auth</p>
            <h2 className="mt-2 text-3xl font-black">{authMode === "signup" ? "Create account" : authMode === "reset" ? "Reset student password" : "Login"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-3">
            {roleOptions.map((item) => {
              const Icon = item.icon
              const selected = item.id === role
              return (
                <button key={item.id} type="button" onClick={() => onRoleChange(item.id)} className={`rounded-[1.25rem] border p-4 text-left transition ${selected ? "border-blue-300 bg-blue-50 dark:border-blue-300/40 dark:bg-blue-400/15" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${selected ? "bg-blue-700 text-white" : "bg-slate-100 text-blue-700 dark:bg-white/10 dark:text-teal-200"}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-black">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-300">{item.description}</span>
                    </span>
                  </div>
                </button>
              )
            })}

            <div className="rounded-[1.25rem] bg-slate-950 p-4 text-white">
              <p className="text-sm font-black text-teal-200">Role-safe login</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Login checks all account types. If a student enters credentials while the shopkeeper tab is selected, UniTap still opens the student dashboard.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-5 flex flex-wrap gap-2">
              <ModeButton active={authMode === "login"} onClick={() => onModeChange("login")}>Login</ModeButton>
              <ModeButton active={authMode === "signup"} onClick={() => onModeChange("signup")}>Signup</ModeButton>
              {role === "student" && <ModeButton active={authMode === "reset"} onClick={() => onModeChange("reset")}>Forgot Password</ModeButton>}
            </div>

            <RoleFields authMode={authMode} form={form} role={role} onUpdate={onUpdate} />

            <button type="submit" disabled={loading} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-700 to-teal-500 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Please wait..." : authMode === "signup" ? "Create Account" : authMode === "reset" ? "Reset Password" : "Login"}
            </button>
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 dark:bg-slate-950 dark:text-slate-200">{status}</p>
          </form>
        </div>
      </div>
    </div>
  )
}

function RoleFields({
  authMode,
  form,
  role,
  onUpdate,
}: {
  authMode: AuthMode
  form: typeof initialForm
  role: Role
  onUpdate: (key: keyof typeof initialForm, value: string | boolean) => void
}) {
  if (authMode === "login") {
    return (
      <div className="grid gap-4">
        <Field
          label="Student ID / Official Email / Shop Email / Phone"
          value={form.loginIdentifier}
          onChange={(value) => onUpdate("loginIdentifier", value)}
          placeholder="Enter any valid UniTap account identifier"
        />
        <Field label="Password" value={form.password} onChange={(value) => onUpdate("password", value)} placeholder="Enter password" />
      </div>
    )
  }

  if (authMode === "reset") {
    return (
      <div className="grid gap-4">
        <Field label="Student ID" value={form.studentId} onChange={(value) => onUpdate("studentId", value)} placeholder="Enter student ID" />
        <Field label="Date of Birth" type="date" value={form.dob} onChange={(value) => onUpdate("dob", value)} />
        <Field label="New Password" value={form.newPassword} onChange={(value) => onUpdate("newPassword", value)} placeholder="New password" />
      </div>
    )
  }

  if (role === "student") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Student ID" value={form.studentId} onChange={(value) => onUpdate("studentId", value)} placeholder="Enter student ID" />
        {authMode === "signup" && (
          <>
            <Field label="University Name" value={form.studentUniversityName} onChange={(value) => onUpdate("studentUniversityName", value)} placeholder="Northbridge University" />
            <Field label="City" value={form.studentCity} onChange={(value) => onUpdate("studentCity", value)} placeholder="Bengaluru" />
            <Field label="State" value={form.studentState} onChange={(value) => onUpdate("studentState", value)} placeholder="Karnataka" />
            <Field label="Country" value={form.studentCountry} onChange={(value) => onUpdate("studentCountry", value)} placeholder="India" />
            <Field label="Date of Birth" type="date" value={form.dob} onChange={(value) => onUpdate("dob", value)} />
          </>
        )}
        <Field label="Password" value={form.password} onChange={(value) => onUpdate("password", value)} placeholder="Create password" />
      </div>
    )
  }

  if (role === "university") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {authMode === "signup" && (
          <>
            <Field label="University Name" value={form.name} onChange={(value) => onUpdate("name", value)} placeholder="Northbridge University" />
            <Field label="Phone Number" value={form.phone} onChange={(value) => onUpdate("phone", value)} placeholder="+91 98765 43210" />
            <Field label="Address" value={form.address} onChange={(value) => onUpdate("address", value)} placeholder="Campus address" />
            <Field label="Website" value={form.website} onChange={(value) => onUpdate("website", value)} placeholder="https://university.edu" />
            <Field label="Registration ID" value={form.registrationId} onChange={(value) => onUpdate("registrationId", value)} placeholder="UNI-NB-2026" />
          </>
        )}
        <Field label="Official Email" value={form.officialEmail} onChange={(value) => onUpdate("officialEmail", value)} placeholder="unihead@unitap.edu" />
        <Field label="Password" value={form.password} onChange={(value) => onUpdate("password", value)} placeholder="Create password" />
      </div>
    )
  }

  if (role === "shopkeeper") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {authMode === "signup" ? (
          <>
            <Field label="Shop Name" value={form.shopName} onChange={(value) => onUpdate("shopName", value)} placeholder="Uni Cafe" />
            <Field label="Shop Location" value={form.location} onChange={(value) => onUpdate("location", value)} placeholder="North Canteen Block" />
            <Field label="Email" value={form.email} onChange={(value) => onUpdate("email", value)} placeholder="shopkeeper@unitap.edu" />
            <Field label="Phone Number" value={form.phone} onChange={(value) => onUpdate("phone", value)} placeholder="+91 90000 11111" />
            <Field label="University Registration ID" value={form.registrationId} onChange={(value) => onUpdate("registrationId", value)} placeholder="UNI-NB-2026" />
            <Field label="Password" value={form.password} onChange={(value) => onUpdate("password", value)} placeholder="Create password" />
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Products and Prices
              <textarea value={form.products} onChange={(event) => onUpdate("products", event.target.value)} disabled={form.skipProducts} className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 dark:border-white/10 dark:bg-slate-950" placeholder="Product name,price" />
            </label>
            <label className="flex items-center gap-3 text-sm font-bold md:col-span-2">
              <input type="checkbox" checked={form.skipProducts} onChange={(event) => onUpdate("skipProducts", event.target.checked)} />
              Skip products now and add them later
            </label>
          </>
        ) : (
          <>
            <Field label="Email or Phone" value={form.identifier} onChange={(value) => onUpdate("identifier", value)} placeholder="shopkeeper@unitap.edu" />
            <Field label="Password" value={form.password} onChange={(value) => onUpdate("password", value)} placeholder="Enter password" />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <Field label="Super Admin Email" value={form.email} onChange={(value) => onUpdate("email", value)} placeholder="superadmin@unitap.edu" />
      <Field label="Password" value={form.password} onChange={(value) => onUpdate("password", value)} placeholder="Enter password" />
    </div>
  )
}

function Workspace({
  form,
  loading,
  session,
  shops,
  status,
  onOpenAuth,
  onModerateShop,
  onTopup,
  onUpdate,
}: {
  form: typeof initialForm
  loading: boolean
  session: Session | null
  shops: Shop[]
  status: string
  onOpenAuth: (mode: AuthMode, role?: Role) => void
  onModerateShop: (shopId: string, action: "approve" | "ban" | "suspend" | "activate") => void
  onTopup: () => void
  onUpdate: (key: keyof typeof initialForm, value: string | boolean) => void
}) {
  if (!session) {
    return (
      <div className="relative overflow-hidden rounded-[2.75rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur dark:border-white/10 dark:bg-white/10 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/10" />
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">Your secure workspace</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Login to open the live UniTap dashboard.</h2>
            <p className="mt-4 max-w-xl leading-8 text-slate-600 dark:text-slate-300">
              Universal login detects the real account type and opens the correct student, shopkeeper, university, or super admin workspace.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => onOpenAuth("login", "student")} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-1 dark:bg-white dark:text-slate-950">
                Login Now
              </button>
              <button type="button" onClick={() => onOpenAuth("signup", "student")} className="rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10 dark:text-white">
                Create Student Account
              </button>
            </div>
          </div>
          <div className="relative grid gap-3 rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl">
            {[
              ["Student", "Wallet top-up, receipts, RFID card status"],
              ["Shopkeeper", "Product menu, payments, approval state"],
              ["University", "Shop approvals, bans, campus oversight"],
              ["Super Admin", "Platform totals, signups, login activity"],
            ].map(([title, detail]) => (
              <div key={title} className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-4">
                <div>
                  <p className="font-black">{title}</p>
                  <p className="mt-1 text-sm text-slate-300">{detail}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-blue-900/10 dark:border-white/10 dark:bg-white/10">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 dark:border-white/10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">Logged in</p>
        <h2 className="text-3xl font-black">{roleLabel(session.role)} Dashboard</h2>
        <p className="font-semibold text-slate-600 dark:text-slate-300">{session.message || status}</p>
      </div>

      {session.role === "university" && (
        <div className="mt-6">
          <h3 className="text-xl font-black">Campus Shop Approvals</h3>
          <div className="mt-4 grid gap-4">
            {shops.map((shop) => (
              <div key={shop.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h4 className="font-black">{shop.shopName}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{shop.location} · {shop.email} · {shop.phone}</p>
                    <p className="mt-1 text-sm font-bold text-blue-700 dark:text-blue-300">Status: {shop.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton icon={CheckCircle2} label="Approve" onClick={() => onModerateShop(shop.id, "approve")} />
                    <ActionButton icon={CirclePause} label="Stop" onClick={() => onModerateShop(shop.id, "suspend")} />
                    <ActionButton icon={Ban} label="Ban" onClick={() => onModerateShop(shop.id, "ban")} />
                  </div>
                </div>
              </div>
            ))}
            {shops.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-slate-600 dark:bg-slate-950 dark:text-slate-300">No shops registered for this university yet.</p>}
          </div>
        </div>
      )}

      {session.role === "student" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-sm font-black uppercase tracking-wide text-slate-500">Wallet Balance</p>
            <p className="mt-2 text-4xl font-black">₹{Number(session.user?.walletBalance || 0).toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Top-ups are created with Razorpay and credited after signature verification.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
            <h3 className="text-xl font-black">Top Up Wallet</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={form.topupAmount}
                onChange={(event) => onUpdate("topupAmount", event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900"
                placeholder="Amount in INR"
              />
              <button
                type="button"
                disabled={loading}
                onClick={onTopup}
                className="rounded-2xl bg-gradient-to-r from-blue-700 to-teal-500 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                Pay with Razorpay
              </button>
            </div>
          </div>
        </div>
      )}

      {session.role === "superAdmin" && session.overview && (
        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Object.entries(session.overview.totals).map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{key}</p>
                <p className="mt-2 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <h3 className="font-black">Universities and Canteens</h3>
            <div className="mt-3 grid gap-3">
              {session.overview.universities.map((university) => (
                <div key={university.id} className="flex flex-col justify-between gap-2 rounded-xl bg-white p-3 dark:bg-white/10 sm:flex-row">
                  <span className="font-bold">{university.name} ({university.registrationId})</span>
                  <span className="text-sm font-black text-blue-700 dark:text-blue-300">{university.canteens} canteens · {university.pendingShops} pending</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LandingBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[520px] w-[min(100%,72rem)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/50 via-teal-100/30 to-transparent blur-3xl dark:from-blue-600/20 dark:via-teal-500/10" />
    </div>
  )
}

function RevealSection({ children }: { children: React.ReactNode }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className={visible ? "animate-fade-up" : "opacity-0 translate-y-8"}>
      {children}
    </div>
  )
}

function useInView(threshold = 0.12) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

function MarqueeSection({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <section className="border-y border-white/70 bg-white/35 py-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee gap-12 px-6">
          {doubled.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="shrink-0 text-sm font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function BentoGrid({
  features,
}: {
  features: Array<{
    title: string
    description: string
    icon: React.ElementType
    className: string
    large?: boolean
  }>
}) {
  return (
    <div className="mt-10 grid auto-rows-[minmax(140px,auto)] gap-4 md:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon
        return (
          <article
            key={feature.title}
            className={`group relative overflow-hidden rounded-[2rem] border border-white/70 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 ${feature.className}`}
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/20 blur-2xl transition group-hover:scale-125" />
            <div className="relative">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${feature.large ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700 dark:bg-white/10 dark:text-teal-200"}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className={`mt-5 font-black ${feature.large ? "text-3xl" : "text-xl"}`}>{feature.title}</h3>
              <p className={`mt-3 leading-7 ${feature.large ? "max-w-md text-blue-50" : "text-slate-600 dark:text-slate-300"}`}>
                {feature.description}
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function RolePreviewSection({
  previewRole,
  onRoleChange,
  onOpenAuth,
}: {
  previewRole: Role
  onRoleChange: (role: Role) => void
  onOpenAuth: (mode: AuthMode, role?: Role) => void
}) {
  const preview = rolePreviewContent[previewRole]
  const activeRole = roleOptions.find((item) => item.id === previewRole)

  return (
    <div className="mt-10 overflow-hidden rounded-[2.75rem] border border-white/70 bg-white/80 shadow-2xl dark:border-white/10 dark:bg-white/10">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4 dark:border-white/10">
        {roleOptions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onRoleChange(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              previewRole === item.id
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.1fr] lg:p-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
            {activeRole?.label} preview
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight">{preview.headline}</h3>
          <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">{activeRole?.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth("login", previewRole)}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
            >
              Open {roleLabel(previewRole)} login
            </button>
            {previewRole !== "superAdmin" && (
              <button
                type="button"
                onClick={() => onOpenAuth("signup", previewRole)}
                className="rounded-full border border-blue-200 px-5 py-3 text-sm font-black text-blue-700 dark:border-white/10 dark:text-white"
              >
                Sign up
              </button>
            )}
          </div>
        </div>
        <div className={`rounded-[2rem] bg-gradient-to-br ${preview.accent} p-6 text-white shadow-xl`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white/80">Snapshot</p>
            {activeRole && <activeRole.icon className="h-8 w-8 text-white/90" />}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {preview.metrics.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wide text-white/70">{label}</p>
                <p className="mt-2 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TestimonialsSection({
  items,
}: {
  items: Array<{ quote: string; name: string; role: string; stars: number }>
}) {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.name}
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/10"
        >
          <Quote className="h-10 w-10 text-teal-500/40" />
          <p className="mt-4 text-lg font-semibold leading-8 text-slate-700 dark:text-slate-200">&ldquo;{item.quote}&rdquo;</p>
          <div className="mt-5 flex gap-1">
            {Array.from({ length: item.stars }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-orange-400 text-orange-400" />
            ))}
          </div>
          <p className="mt-4 font-black">{item.name}</p>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.role}</p>
        </article>
      ))}
    </div>
  )
}

function FaqSection({ items }: { items: Array<{ q: string; a: string }> }) {
  const [openIndex, setOpenIndex] = React.useState(0)

  return (
    <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-xl shadow-blue-950/5 backdrop-blur dark:divide-white/10 dark:border-white/10 dark:bg-white/10">
      {items.map((item, index) => {
        const open = openIndex === index
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <span className="font-black">{item.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <p className="px-6 pb-5 leading-7 text-slate-600 dark:text-slate-300">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}

function CtaBand({ onOpenAuth }: { onOpenAuth: (mode: AuthMode, role?: Role) => void }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-slate-950 via-blue-950 to-teal-900 p-10 text-white shadow-2xl animate-gradient-bg">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">Ready when you are</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Put your entire campus on one tap payment rail.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Connect Supabase, enable Razorpay, and onboard students, shops, and university heads in minutes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onOpenAuth("signup", "university")}
              className="rounded-full bg-white px-7 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-1"
            >
              Start university onboarding
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth("login", "student")}
              className="rounded-full border border-white/30 px-7 py-4 text-sm font-black text-white transition hover:-translate-y-1"
            >
              Student login
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="absolute -left-5 top-8 hidden animate-float rounded-3xl border border-white/70 bg-white/90 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur dark:border-white/10 dark:bg-white/10 sm:block">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-green-100 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">Payment</p>
            <p className="font-black">Verified</p>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 bottom-12 hidden rounded-3xl border border-white/70 bg-white/90 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur dark:border-white/10 dark:bg-white/10 md:block">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-100 text-orange-700">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">Queue saved</p>
            <p className="font-black">12 sec</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-white/70 bg-white/85 p-3 shadow-2xl shadow-blue-900/15 backdrop-blur dark:border-white/10 dark:bg-white/10 sm:p-5">
      <div className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_20%_0%,#1d4ed8_0,#020617_35%,#020617_100%)] p-5 text-white sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-teal-300">Live RFID Tap</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Campus Wallet</h2>
          </div>
          <WalletCards className="h-9 w-9 text-orange-300" />
        </div>

        <div className="mt-7 rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-teal-500 to-orange-400 p-5 text-white shadow-2xl shadow-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-white/80">RFID Student Card</p>
              <p className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">**** 2841</p>
            </div>
            <Radio className="h-7 w-7" />
          </div>
          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Balance</p>
              <p className="mt-1 text-3xl font-black sm:text-4xl">₹2,480</p>
            </div>
            <p className="rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur">Active</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Uni Cafe", "₹95 paid"],
            ["North Canteen", "approved"],
            ["Fraud Check", "clear"],
            ["Platform Health", "99.98%"],
          ].map(([title, value]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-300">{title}</p>
              <p className="mt-2 text-xl font-black sm:text-2xl">{value}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

function Footer({ onOpenAuth }: { onOpenAuth: (mode: AuthMode, role?: Role) => void }) {
  return (
    <footer className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
        <div className="relative grid gap-12 p-8 lg:grid-cols-[1.1fr_1.7fr] lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-teal-500 to-orange-400 text-white">
              <Radio className="h-5 w-5" />
            </span>
            <span className="text-xl font-black">UniTap</span>
          </div>
          <p className="mt-4 max-w-sm leading-7 text-slate-300">
            Smart campus cashless payments with RFID wallets, vendor moderation, Razorpay top-ups, and role-safe dashboards.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => onOpenAuth("signup", "university")} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-1">
              Onboard campus
            </button>
            <button type="button" onClick={() => onOpenAuth("login", "student")} className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1">
              Login
            </button>
          </div>
        </div>
        <div className="relative grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-200">Product</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
              <a href="#platform" className="hover:text-white">Platform</a>
              <a href="#preview" className="hover:text-white">Preview</a>
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#workspace" className="hover:text-white">Workspace</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-200">Accounts</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
              <button type="button" onClick={() => onOpenAuth("login", "student")} className="text-left hover:text-white">Student login</button>
              <button type="button" onClick={() => onOpenAuth("signup", "shopkeeper")} className="text-left hover:text-white">Shopkeeper signup</button>
              <button type="button" onClick={() => onOpenAuth("signup", "university")} className="text-left hover:text-white">University signup</button>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-200">Stack</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
              <span>Next.js frontend</span>
              <span>Node + Supabase API</span>
              <span>Razorpay wallet verify</span>
            </div>
          </div>
        </div>
      </div>
        <div className="relative flex flex-col gap-3 border-t border-white/10 px-8 py-6 text-sm font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <p>© {new Date().getFullYear()} UniTap. Smart Campus Cashless Payment Platform.</p>
        <button type="button" onClick={() => onOpenAuth("login", "superAdmin")} className="text-left hover:text-white">
          Super admin login
        </button>
        </div>
      </div>
    </footer>
  )
}

function RoleCard({
  id,
  label,
  description,
  icon: Icon,
  onLogin,
  onSignup,
}: {
  id: Role
  label: string
  description: string
  icon: React.ElementType
  onLogin: () => void
  onSignup: () => void
}) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10 dark:border-white/10 dark:bg-white/10">
      <div className="absolute right-[-3rem] top-[-3rem] h-28 w-28 rounded-full bg-gradient-to-br from-blue-200 to-teal-200 opacity-0 blur-2xl transition group-hover:opacity-80 dark:from-blue-500/20 dark:to-teal-400/20" />
      <div className="relative flex h-full flex-col">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700 transition group-hover:scale-110 dark:bg-white/10 dark:text-teal-200">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-xl font-black">{label}</h3>
        <p className="mt-3 min-h-20 leading-7 text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-auto h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-600 to-teal-400 transition group-hover:w-full" />
        </div>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onLogin} className="rounded-full border border-blue-200 px-4 py-2 text-sm font-black text-blue-700 dark:border-white/10 dark:text-white">Login</button>
        {id !== "superAdmin" && (
          <button type="button" onClick={onSignup} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">Signup</button>
        )}
      </div>
      </div>
    </article>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-teal-700 shadow-sm backdrop-blur dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-200">
        <BarChart3 className="h-4 w-4" />
        {eyebrow}
      </div>
      <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  )
}

function Field({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  value: string
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
        placeholder={placeholder}
      />
    </label>
  )
}

function ModeButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-black ${active ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300"}`}>
      {children}
    </button>
  )
}

function ActionButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function parseProducts(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, price] = line.split(",")
      return { name: name?.trim(), price: Number(price) }
    })
    .filter((product) => product.name && Number.isFinite(product.price))
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."))
    document.body.appendChild(script)
  })
}

function roleLabel(role: Role) {
  if (role === "superAdmin") return "Super Admin"
  if (role === "university") return "University Head"
  return role[0].toUpperCase() + role.slice(1)
}
