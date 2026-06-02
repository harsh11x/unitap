import 'package:flutter/material.dart';

void main() {
  runApp(const UniTapMobileApp());
}

const unitapBlue = Color(0xFF2563EB);
const unitapTeal = Color(0xFF14B8A6);
const unitapOrange = Color(0xFFF97316);
const unitapInk = Color(0xFF020617);
const unitapBg = Color(0xFFF7FBFF);

class UniTapMobileApp extends StatelessWidget {
  const UniTapMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'UniTap',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: unitapBg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: unitapBlue,
          primary: unitapBlue,
          secondary: unitapTeal,
          tertiary: unitapOrange,
          surface: Colors.white,
        ),
      ),
      home: const WelcomeGate(),
    );
  }
}

class WelcomeGate extends StatefulWidget {
  const WelcomeGate({super.key});

  @override
  State<WelcomeGate> createState() => _WelcomeGateState();
}

class _WelcomeGateState extends State<WelcomeGate> {
  bool _showApp = false;

  @override
  Widget build(BuildContext context) {
    if (_showApp) return const UniTapShell();

    return WelcomeScreen(onContinue: () => setState(() => _showApp = true));
  }
}

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key, required this.onContinue});

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: UniTapScaffold(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(22, 22, 22, 28),
            children: [
              const Row(
                children: [
                  GradientLogo(),
                  SizedBox(width: 12),
                  Text(
                    'UniTap',
                    style: TextStyle(
                      color: unitapInk,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 34),
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: unitapInk,
                  borderRadius: BorderRadius.circular(34),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x220F172A),
                      blurRadius: 34,
                      offset: Offset(0, 18),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const PillLabel(
                      icon: Icons.sensors_rounded,
                      label: 'Welcome to smart campus pay',
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Tap. Pay. Track. All across campus.',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 40,
                        fontWeight: FontWeight.w900,
                        height: 0.95,
                        letterSpacing: -1.7,
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'A cashless RFID wallet app for students, shopkeepers, university heads, and platform admins.',
                      style: TextStyle(color: Colors.white70, height: 1.55),
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(28),
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [unitapBlue, unitapTeal, unitapOrange],
                        ),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'RFID Student Card',
                            style: TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          SizedBox(height: 18),
                          Text(
                            '**** 2841',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'INR 2,480',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 30,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Icon(
                                Icons.wifi_tethering_rounded,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              const Row(
                children: [
                  Expanded(
                    child: WelcomeMetric(
                      icon: Icons.flash_on_rounded,
                      title: '0.4s',
                      subtitle: 'tap auth',
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: WelcomeMetric(
                      icon: Icons.verified_user_rounded,
                      title: '4 roles',
                      subtitle: 'one app',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 22),
              GradientButton(label: 'Get Started', onPressed: onContinue),
              const SizedBox(height: 12),
              OutlineActionButton(
                label: 'Explore UniTap',
                onPressed: onContinue,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class WelcomeMetric extends StatelessWidget {
  const WelcomeMetric({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: premiumCardDecoration(radius: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: unitapTeal),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              color: unitapInk,
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 11,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

enum UniTapRole { student, shopkeeper, university, superAdmin }

extension UniTapRoleUi on UniTapRole {
  String get label {
    switch (this) {
      case UniTapRole.student:
        return 'Student';
      case UniTapRole.shopkeeper:
        return 'Shopkeeper';
      case UniTapRole.university:
        return 'University Head';
      case UniTapRole.superAdmin:
        return 'Super Admin';
    }
  }

  IconData get icon {
    switch (this) {
      case UniTapRole.student:
        return Icons.school_rounded;
      case UniTapRole.shopkeeper:
        return Icons.storefront_rounded;
      case UniTapRole.university:
        return Icons.account_balance_rounded;
      case UniTapRole.superAdmin:
        return Icons.verified_user_rounded;
    }
  }

  String get description {
    switch (this) {
      case UniTapRole.student:
        return 'Student ID wallet, top-ups, receipts, and RFID card status.';
      case UniTapRole.shopkeeper:
        return 'Counter payments, product menus, and university approval status.';
      case UniTapRole.university:
        return 'Approve, pause, ban, and monitor campus shops.';
      case UniTapRole.superAdmin:
        return 'Platform totals, universities, canteens, logins, and signups.';
    }
  }
}

class UniTapShell extends StatefulWidget {
  const UniTapShell({super.key});

  @override
  State<UniTapShell> createState() => _UniTapShellState();
}

class _UniTapShellState extends State<UniTapShell> {
  int _tab = 0;
  UniTapRole _role = UniTapRole.student;

  void _openAuth({required bool signup, UniTapRole? role}) {
    if (role != null) setState(() => _role = role);

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AuthSheet(
        role: role ?? _role,
        signup: signup,
        onRoleChanged: (nextRole) => setState(() => _role = nextRole),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomePage(
        role: _role,
        onRoleChanged: (role) => setState(() => _role = role),
        onOpenAuth: _openAuth,
      ),
      RolesPage(
        selectedRole: _role,
        onRoleChanged: (role) => setState(() => _role = role),
        onOpenAuth: _openAuth,
      ),
      WorkspacePage(onOpenAuth: _openAuth),
    ];

    return Scaffold(
      body: SafeArea(child: pages[_tab]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xFFE0F2FE),
        onDestinationSelected: (index) => setState(() => _tab = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: 'Home'),
          NavigationDestination(
            icon: Icon(Icons.dashboard_customize_rounded),
            label: 'Roles',
          ),
          NavigationDestination(
            icon: Icon(Icons.wallet_rounded),
            label: 'Workspace',
          ),
        ],
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({
    super.key,
    required this.role,
    required this.onRoleChanged,
    required this.onOpenAuth,
  });

  final UniTapRole role;
  final ValueChanged<UniTapRole> onRoleChanged;
  final void Function({required bool signup, UniTapRole? role}) onOpenAuth;

  @override
  Widget build(BuildContext context) {
    return UniTapScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          const UniTapHeader(),
          const SizedBox(height: 26),
          const PillLabel(
            icon: Icons.sensors_rounded,
            label: 'Cashless campus operating system',
          ),
          const SizedBox(height: 18),
          const Text(
            'A faster, smarter payment layer for every campus tap.',
            style: TextStyle(
              color: unitapInk,
              fontSize: 38,
              fontWeight: FontWeight.w900,
              height: 0.98,
              letterSpacing: -1.8,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'UniTap turns student ID cards into secure wallets, gives shopkeepers a fast checkout flow, and gives university heads a live command center.',
            style: TextStyle(color: Color(0xFF475569), height: 1.55),
          ),
          const SizedBox(height: 22),
          Row(
            children: [
              Expanded(
                child: GradientButton(
                  label: 'Launch Campus',
                  onPressed: () =>
                      onOpenAuth(signup: true, role: UniTapRole.university),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlineActionButton(
                  label: 'Login',
                  onPressed: () => onOpenAuth(signup: false),
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          const WalletPreviewCard(),
          const SizedBox(height: 22),
          const StatsGrid(),
          const SizedBox(height: 22),
          const MovingTextStrip(
            items: [
              'RFID TAP-TO-PAY',
              'CAMPUS WALLETS',
              'LIVE ANALYTICS',
              'VENDOR APPROVALS',
              'RAZORPAY TOP-UPS',
              'FRAUD MONITORING',
            ],
          ),
          const SizedBox(height: 28),
          RolePreview(
            role: role,
            onRoleChanged: onRoleChanged,
            onOpenAuth: onOpenAuth,
          ),
        ],
      ),
    );
  }
}

class RolesPage extends StatelessWidget {
  const RolesPage({
    super.key,
    required this.selectedRole,
    required this.onRoleChanged,
    required this.onOpenAuth,
  });

  final UniTapRole selectedRole;
  final ValueChanged<UniTapRole> onRoleChanged;
  final void Function({required bool signup, UniTapRole? role}) onOpenAuth;

  @override
  Widget build(BuildContext context) {
    return UniTapScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          const UniTapHeader(),
          const SizedBox(height: 24),
          const SectionTitle(
            title: 'Purpose-built mobile workspaces',
            body:
                'The Flutter app mirrors the web roles and is ready to connect to the same Node backend.',
          ),
          const SizedBox(height: 18),
          for (final role in UniTapRole.values) ...[
            RoleCard(
              role: role,
              selected: selectedRole == role,
              onTap: () => onRoleChanged(role),
              onLogin: () => onOpenAuth(signup: false, role: role),
              onSignup: role == UniTapRole.superAdmin
                  ? null
                  : () => onOpenAuth(signup: true, role: role),
            ),
            const SizedBox(height: 14),
          ],
        ],
      ),
    );
  }
}

class WorkspacePage extends StatelessWidget {
  const WorkspacePage({super.key, required this.onOpenAuth});

  final void Function({required bool signup, UniTapRole? role}) onOpenAuth;

  @override
  Widget build(BuildContext context) {
    return UniTapScaffold(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          const UniTapHeader(),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: premiumCardDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PillLabel(
                  icon: Icons.lock_rounded,
                  label: 'Secure workspace',
                ),
                const SizedBox(height: 18),
                const Text(
                  'Login to open the live UniTap dashboard.',
                  style: TextStyle(
                    color: unitapInk,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Universal login will detect the real account type and open the correct mobile dashboard.',
                  style: TextStyle(color: Color(0xFF475569), height: 1.55),
                ),
                const SizedBox(height: 18),
                GradientButton(
                  label: 'Login Now',
                  onPressed: () => onOpenAuth(signup: false),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const WorkspaceFeature(
            title: 'Student',
            subtitle: 'Wallet balance, top-up, receipts, RFID status',
            icon: Icons.school_rounded,
          ),
          const WorkspaceFeature(
            title: 'Shopkeeper',
            subtitle: 'Checkout, product menu, approval status',
            icon: Icons.storefront_rounded,
          ),
          const WorkspaceFeature(
            title: 'University',
            subtitle: 'Shop approvals, bans, campus operations',
            icon: Icons.account_balance_rounded,
          ),
          const WorkspaceFeature(
            title: 'Super Admin',
            subtitle: 'Platform totals, activity, universities',
            icon: Icons.verified_user_rounded,
          ),
        ],
      ),
    );
  }
}

class UniTapScaffold extends StatelessWidget {
  const UniTapScaffold({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.topLeft,
          radius: 1.35,
          colors: [Color(0xFFEAF4FF), unitapBg, Color(0xFFFFFBF4)],
        ),
      ),
      child: child,
    );
  }
}

class UniTapHeader extends StatelessWidget {
  const UniTapHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        GradientLogo(),
        SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'UniTap',
              style: TextStyle(
                color: unitapInk,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            Text(
              'Smart Campus Pay',
              style: TextStyle(
                color: Color(0xFF64748B),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class GradientLogo extends StatelessWidget {
  const GradientLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 46,
      width: 46,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [unitapBlue, unitapTeal, unitapOrange],
        ),
      ),
      child: const Icon(Icons.sensors_rounded, color: Colors.white),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({super.key, required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: unitapInk,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            letterSpacing: -1,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          body,
          style: const TextStyle(color: Color(0xFF475569), height: 1.55),
        ),
      ],
    );
  }
}

class WalletPreviewCard extends StatelessWidget {
  const WalletPreviewCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: unitapInk,
        borderRadius: BorderRadius.circular(34),
        boxShadow: const [
          BoxShadow(
            color: Color(0x220F172A),
            blurRadius: 30,
            offset: Offset(0, 18),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Live RFID Tap',
                    style: TextStyle(
                      color: unitapTeal,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Campus Wallet',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 25,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
              Icon(Icons.account_balance_wallet_rounded, color: unitapOrange),
            ],
          ),
          const SizedBox(height: 22),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(26),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [unitapBlue, unitapTeal, unitapOrange],
              ),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'RFID Student Card',
                  style: TextStyle(
                    color: Colors.white70,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: 22),
                Text(
                  '**** 2841',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 22),
                Text(
                  'BALANCE',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    letterSpacing: 2.5,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'INR 2,480',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          const Row(
            children: [
              Expanded(
                child: WalletMetric(title: 'Uni Cafe', value: 'INR 95'),
              ),
              SizedBox(width: 12),
              Expanded(
                child: WalletMetric(title: 'North Canteen', value: 'Approved'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class WalletMetric extends StatelessWidget {
  const WalletMetric({super.key, required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white60)),
          const SizedBox(height: 7),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class StatsGrid extends StatelessWidget {
  const StatsGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final stats = [
      ('0.4s', 'RFID authorization'),
      ('4', 'role dashboards'),
      ('100%', 'cashless audit'),
      ('Live', 'wallet data'),
    ];

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: stats.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.35,
      ),
      itemBuilder: (context, index) {
        final stat = stats[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: premiumCardDecoration(radius: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              GradientText(stat.$1, fontSize: 28),
              const SizedBox(height: 8),
              Text(
                stat.$2.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF475569),
                  fontSize: 11,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class MovingTextStrip extends StatefulWidget {
  const MovingTextStrip({super.key, required this.items});

  final List<String> items;

  @override
  State<MovingTextStrip> createState() => _MovingTextStripState();
}

class _MovingTextStripState extends State<MovingTextStrip>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 28),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final labels = [...widget.items, ...widget.items];
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: Container(
        height: 58,
        color: Colors.white.withValues(alpha: 0.55),
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return FractionalTranslation(
              translation: Offset(-_controller.value, 0),
              child: child,
            );
          },
          child: Row(
            children: [
              for (final label in labels)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  child: Text(
                    label,
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 12,
                      letterSpacing: 2,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class RolePreview extends StatelessWidget {
  const RolePreview({
    super.key,
    required this.role,
    required this.onRoleChanged,
    required this.onOpenAuth,
  });

  final UniTapRole role;
  final ValueChanged<UniTapRole> onRoleChanged;
  final void Function({required bool signup, UniTapRole? role}) onOpenAuth;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: premiumCardDecoration(radius: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Switch dashboard previews',
            style: TextStyle(
              color: unitapInk,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final option in UniTapRole.values)
                ChoiceChip(
                  label: Text(option.label),
                  selected: role == option,
                  selectedColor: unitapInk,
                  labelStyle: TextStyle(
                    color: role == option ? Colors.white : unitapInk,
                    fontWeight: FontWeight.w800,
                  ),
                  onSelected: (_) => onRoleChanged(option),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(26),
              gradient: const LinearGradient(colors: [unitapBlue, unitapTeal]),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(role.icon, color: Colors.white, size: 34),
                const SizedBox(height: 12),
                Text(
                  role.label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  role.description,
                  style: const TextStyle(color: Colors.white70, height: 1.5),
                ),
                const SizedBox(height: 16),
                GradientButton(
                  label: 'Open ${role.label} Login',
                  light: true,
                  onPressed: () => onOpenAuth(signup: false, role: role),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class RoleCard extends StatelessWidget {
  const RoleCard({
    super.key,
    required this.role,
    required this.selected,
    required this.onTap,
    required this.onLogin,
    required this.onSignup,
  });

  final UniTapRole role;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onLogin;
  final VoidCallback? onSignup;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(28),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: premiumCardDecoration(
          radius: 28,
          borderColor: selected ? unitapBlue.withValues(alpha: 0.35) : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              backgroundColor: selected ? unitapBlue : const Color(0xFFEFF6FF),
              foregroundColor: selected ? Colors.white : unitapBlue,
              child: Icon(role.icon),
            ),
            const SizedBox(height: 14),
            Text(
              role.label,
              style: const TextStyle(
                color: unitapInk,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              role.description,
              style: const TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                TextButton(onPressed: onLogin, child: const Text('Login')),
                if (onSignup != null)
                  TextButton(onPressed: onSignup, child: const Text('Signup')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class AuthSheet extends StatefulWidget {
  const AuthSheet({
    super.key,
    required this.role,
    required this.signup,
    required this.onRoleChanged,
  });

  final UniTapRole role;
  final bool signup;
  final ValueChanged<UniTapRole> onRoleChanged;

  @override
  State<AuthSheet> createState() => _AuthSheetState();
}

class _AuthSheetState extends State<AuthSheet> {
  late UniTapRole _role = widget.role;
  late bool _signup = widget.signup;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.82,
      minChildSize: 0.45,
      maxChildSize: 0.95,
      builder: (context, controller) {
        return Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(34)),
          ),
          child: ListView(
            controller: controller,
            children: [
              Center(
                child: Container(
                  height: 5,
                  width: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                _signup ? 'Create account' : 'Login',
                style: const TextStyle(
                  color: unitapInk,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Mobile auth UI is ready for the existing UniTap backend endpoints.',
                style: TextStyle(color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final role in UniTapRole.values)
                    ChoiceChip(
                      label: Text(role.label),
                      selected: _role == role,
                      onSelected: (_) {
                        setState(() => _role = role);
                        widget.onRoleChanged(role);
                      },
                    ),
                ],
              ),
              const SizedBox(height: 18),
              if (!_signup)
                const AppTextField(label: 'Email, phone, or student ID')
              else ...[
                if (_role == UniTapRole.student) ...const [
                  AppTextField(label: 'Student ID'),
                  AppTextField(label: 'University Name'),
                  AppTextField(label: 'City'),
                  AppTextField(label: 'State'),
                  AppTextField(label: 'Country'),
                  AppTextField(label: 'Date of Birth'),
                ],
                if (_role == UniTapRole.shopkeeper) ...const [
                  AppTextField(label: 'Shop Name'),
                  AppTextField(label: 'Shop Location'),
                  AppTextField(label: 'Email'),
                  AppTextField(label: 'Phone'),
                  AppTextField(label: 'University Registration ID'),
                ],
                if (_role == UniTapRole.university) ...const [
                  AppTextField(label: 'University Name'),
                  AppTextField(label: 'Official Email'),
                  AppTextField(label: 'Phone'),
                  AppTextField(label: 'Registration ID'),
                ],
              ],
              const AppTextField(label: 'Password', obscureText: true),
              const SizedBox(height: 10),
              GradientButton(
                label: _signup
                    ? 'Create ${_role.label}'
                    : 'Login as ${_role.label}',
                onPressed: () => Navigator.pop(context),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => setState(() => _signup = !_signup),
                child: Text(
                  _signup
                      ? 'Already have an account? Login'
                      : 'Need an account? Sign up',
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.label,
    this.obscureText = false,
  });

  final String label;
  final bool obscureText;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        obscureText: obscureText,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: const Color(0xFFF8FAFC),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
        ),
      ),
    );
  }
}

class WorkspaceFeature extends StatelessWidget {
  const WorkspaceFeature({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: premiumCardDecoration(radius: 24),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFFEFF6FF),
            foregroundColor: unitapBlue,
            child: Icon(icon),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: unitapInk,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: const TextStyle(color: Color(0xFF64748B), height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PillLabel extends StatelessWidget {
  const PillLabel({super.key, required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.75),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: const Color(0xFFBFDBFE)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: unitapTeal, size: 17),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: unitapBlue,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class GradientButton extends StatelessWidget {
  const GradientButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.light = false,
  });

  final String label;
  final VoidCallback onPressed;
  final bool light;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: light
            ? null
            : const LinearGradient(colors: [unitapBlue, unitapTeal]),
        color: light ? Colors.white : null,
        borderRadius: BorderRadius.circular(999),
        boxShadow: const [
          BoxShadow(
            color: Color(0x302563EB),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          foregroundColor: light ? unitapInk : Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
        ),
        onPressed: onPressed,
        child: Text(label, textAlign: TextAlign.center),
      ),
    );
  }
}

class OutlineActionButton extends StatelessWidget {
  const OutlineActionButton({
    super.key,
    required this.label,
    required this.onPressed,
  });

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: unitapInk,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      onPressed: onPressed,
      child: Text(label),
    );
  }
}

class GradientText extends StatelessWidget {
  const GradientText(this.text, {super.key, required this.fontSize});

  final String text;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => const LinearGradient(
        colors: [unitapBlue, unitapTeal, unitapOrange],
      ).createShader(bounds),
      child: Text(
        text,
        style: TextStyle(
          color: Colors.white,
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

BoxDecoration premiumCardDecoration({double radius = 28, Color? borderColor}) {
  return BoxDecoration(
    color: Colors.white.withValues(alpha: 0.86),
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: borderColor ?? Colors.white),
    boxShadow: const [
      BoxShadow(
        color: Color(0x140F172A),
        blurRadius: 24,
        offset: Offset(0, 12),
      ),
    ],
  );
}
