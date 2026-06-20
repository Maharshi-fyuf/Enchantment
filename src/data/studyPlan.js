/**
 * studyPlan.js — Single source of truth for the 30-day curriculum.
 *
 * To add, edit, or remove days — only touch this file.
 * Components read this data but never mutate it.
 *
 * PILLAR_CONFIG maps pillar IDs (1–4) to their display properties
 * and Tailwind class strings. All class strings are written in full
 * so Tailwind's content scanner keeps them during tree-shaking.
 */

export const PILLAR_CONFIG = {
  1: {
    label: 'OS & Linux',
    fullLabel: 'IT & OS Fundamentals',
    dayRange: 'DAYS 1–7',
    count: 7,
    cardBg:       'bg-teal-50 dark:bg-teal-950',
    cardBorder:   'border-teal-500/40',
    cardText:     'text-teal-900 dark:text-teal-100',
    cardMuted:    'text-teal-700 dark:text-teal-400',
    dotBg:        'bg-teal-600 dark:bg-teal-500',
    dotRing:      'ring-teal-300 dark:ring-teal-700',
    badge:        'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    accentBorder: 'border-teal-500 dark:border-teal-400',
    progressBar:  'bg-teal-500',
    checkBg:      'bg-teal-500 dark:bg-teal-600',
  },
  2: {
    label: 'Networking',
    fullLabel: 'Networking Basics',
    dayRange: 'DAYS 8–15',
    count: 8,
    cardBg:       'bg-violet-50 dark:bg-violet-950',
    cardBorder:   'border-violet-500/40',
    cardText:     'text-violet-900 dark:text-violet-100',
    cardMuted:    'text-violet-700 dark:text-violet-400',
    dotBg:        'bg-violet-600 dark:bg-violet-500',
    dotRing:      'ring-violet-300 dark:ring-violet-700',
    badge:        'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    accentBorder: 'border-violet-500 dark:border-violet-400',
    progressBar:  'bg-violet-500',
    checkBg:      'bg-violet-500 dark:bg-violet-600',
  },
  3: {
    label: 'Programming',
    fullLabel: 'Programming Foundations',
    dayRange: 'DAYS 16–24',
    count: 9,
    cardBg:       'bg-amber-50 dark:bg-amber-950',
    cardBorder:   'border-amber-500/40',
    cardText:     'text-amber-900 dark:text-amber-100',
    cardMuted:    'text-amber-700 dark:text-amber-400',
    dotBg:        'bg-amber-500 dark:bg-amber-400',
    dotRing:      'ring-amber-300 dark:ring-amber-700',
    badge:        'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    accentBorder: 'border-amber-500 dark:border-amber-400',
    progressBar:  'bg-amber-500',
    checkBg:      'bg-amber-500 dark:bg-amber-600',
  },
  4: {
    label: 'Security',
    fullLabel: 'Security Concepts',
    dayRange: 'DAYS 25–30',
    count: 6,
    cardBg:       'bg-orange-50 dark:bg-orange-950',
    cardBorder:   'border-orange-500/40',
    cardText:     'text-orange-900 dark:text-orange-100',
    cardMuted:    'text-orange-700 dark:text-orange-400',
    dotBg:        'bg-orange-600 dark:bg-orange-500',
    dotRing:      'ring-orange-300 dark:ring-orange-700',
    badge:        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    accentBorder: 'border-orange-500 dark:border-orange-400',
    progressBar:  'bg-orange-500',
    checkBg:      'bg-orange-500 dark:bg-orange-600',
  },
};

export const STUDY_DAYS = [
  // ─── PILLAR 1: IT & OS Fundamentals (Days 1–7) ───────────────────────────
  {
    day: 1,
    pillar: 1,
    title: 'Linux — filesystem & navigation',
    theory:
      'Linux history, Filesystem Hierarchy Standard (/etc, /var, /home, /bin, /usr, /tmp), essential commands: ls, cd, pwd, mkdir, rm, cp, mv, cat, less, man. Understand why FHS matters for forensics.',
    lab:
      'OverTheWire Bandit Level 0–3: connect via SSH, navigate directories, read files with unusual names and hidden data.',
    platform: 'OverTheWire: Bandit',
    platformUrl: 'https://overthewire.org/wargames/bandit/',
  },
  {
    day: 2,
    pillar: 1,
    title: 'Linux — file permissions & users',
    theory:
      'chmod (octal + symbolic), chown, the rwx permission model, special bits (SUID, SGID, sticky bit), users vs groups, sudo, /etc/passwd structure, /etc/shadow and why it exists.',
    lab:
      'Bandit Level 4–7 (find files by properties, read data from non-human-readable files) + TryHackMe "Linux Fundamentals Part 1".',
    platform: 'OverTheWire + TryHackMe',
    platformUrl: 'https://tryhackme.com/room/linuxfundamentalspart1',
  },
  {
    day: 3,
    pillar: 1,
    title: 'Linux — processes & text manipulation',
    theory:
      'ps aux, top/htop, kill/killall, job control (bg, fg, &), pipe operator (|), output redirection (>, >>), grep, sort, uniq, cut, tr, wc. Understand stdin/stdout/stderr.',
    lab:
      'Bandit Level 8–12: heavy focus on grep, sort, uniq, base64, rot13, and pipes. Solve each level with a single pipeline.',
    platform: 'OverTheWire: Bandit',
    platformUrl: 'https://overthewire.org/wargames/bandit/',
  },
  {
    day: 4,
    pillar: 1,
    title: 'Linux — networking commands & packages',
    theory:
      'ip addr / ifconfig, netstat -tulpn, ss, ping, traceroute, curl, wget, nmap basics. Package management: apt install/remove/update/upgrade. Understanding repos and /etc/apt/sources.list.',
    lab:
      'Bandit Level 13–16 (SSH private keys, HTTPS retrieval, SSL certs) + TryHackMe "Linux Fundamentals Part 2".',
    platform: 'OverTheWire + TryHackMe',
    platformUrl: 'https://tryhackme.com/room/linuxfundamentalspart2',
  },
  {
    day: 5,
    pillar: 1,
    title: 'Linux — shell environment & variables',
    theory:
      '.bashrc vs .bash_profile vs .profile, environment variables (env, export, $PATH), aliases, history (Ctrl+R), shell expansion ($, *, ?, {}), command substitution $(cmd).',
    lab:
      'Bandit Level 17–20 (diffs, daemons, listening ports) + TryHackMe "Linux Fundamentals Part 3". Write 3 useful shell aliases.',
    platform: 'OverTheWire + TryHackMe',
    platformUrl: 'https://tryhackme.com/room/linuxfundamentalspart3',
  },
  {
    day: 6,
    pillar: 1,
    title: 'Windows internals basics',
    theory:
      'Registry hive structure (HKLM, HKCU), Task Manager vs Process Explorer, Services (sc query), Event Viewer (Event IDs 4624/4625/4648), NTFS ACLs, UAC, PowerShell basics: Get-Process, Get-Service, Get-ChildItem.',
    lab:
      'TryHackMe "Windows Fundamentals 1" and "Windows Fundamentals 2". Explore Event Viewer on a real Windows machine if available.',
    platform: 'TryHackMe',
    platformUrl: 'https://tryhackme.com/room/windowsfundamentals1xbx',
  },
  {
    day: 7,
    pillar: 1,
    title: 'Virtualization & lab setup',
    theory:
      'Type 1 (bare-metal) vs Type 2 (hosted) hypervisors, VirtualBox vs VMware Workstation Player, VM networking modes (NAT vs Bridged vs Host-Only), snapshots and why they matter for security labs.',
    lab:
      'Install VirtualBox + Kali Linux 2024.x. Configure NAT network. Take a snapshot. Verify IP address and run: apt update && apt upgrade.',
    platform: 'VirtualBox (free download)',
    platformUrl: 'https://www.virtualbox.org/',
  },

  // ─── PILLAR 2: Networking (Days 8–15) ────────────────────────────────────
  {
    day: 8,
    pillar: 2,
    title: 'OSI model deep dive',
    theory:
      'All 7 layers in order, PDU names (bits/frames/packets/segments/data), encapsulation and de-encapsulation, where protocols live at each layer, and why this model is a security tool — attack layers map directly to defense layers.',
    lab:
      'TryHackMe "Pre-Security > OSI Model" room. Then draw the OSI model from memory with one real protocol at each layer. Check your work.',
    platform: 'TryHackMe Pre-Security Path',
    platformUrl: 'https://tryhackme.com/room/osimodelzi',
  },
  {
    day: 9,
    pillar: 2,
    title: 'TCP/IP model & the 3-way handshake',
    theory:
      'TCP vs UDP (reliability tradeoffs), SYN / SYN-ACK / ACK handshake, TCP flags (SYN, ACK, FIN, RST, PSH, URG), sequence numbers, IPv4 vs IPv6 header differences, TCP/IP 4-layer model vs OSI mapping.',
    lab:
      'Install Wireshark. Capture a TCP handshake on localhost (e.g., curl a local server). Identify the SYN, SYN-ACK, ACK packets and read their flags in the packet detail pane.',
    platform: 'Wireshark (free)',
    platformUrl: 'https://www.wireshark.org/',
  },
  {
    day: 10,
    pillar: 2,
    title: 'IP addressing & subnetting I',
    theory:
      'IPv4 structure (4 octets, 32 bits), address classes (A/B/C/D/E), private vs public ranges (RFC 1918: 10.x, 172.16.x, 192.168.x), CIDR notation (/24, /16, /8), subnet masks, network vs host vs broadcast address.',
    lab:
      'subnettingpractice.com — complete 25 exercises. For each, identify: network address, broadcast address, first host, last host, number of usable hosts.',
    platform: 'subnettingpractice.com',
    platformUrl: 'https://subnettingpractice.com/',
  },
  {
    day: 11,
    pillar: 2,
    title: 'Subnetting II & NAT',
    theory:
      'VLSM (Variable Length Subnet Masking), calculating usable hosts from CIDR (/30 = 2, /29 = 6, /28 = 14, /24 = 254), default gateway role, NAT vs PAT, why private IPs need translation to reach the internet.',
    lab:
      'TryHackMe "Extending Your Network" room + 20 more subnetting drills with time pressure (aim for under 60 seconds per problem).',
    platform: 'TryHackMe + subnettingpractice.com',
    platformUrl: 'https://tryhackme.com/room/extendingyournetwork',
  },
  {
    day: 12,
    pillar: 2,
    title: "DNS — the internet's phone book",
    theory:
      "DNS hierarchy (root → TLD → authoritative nameserver), resolver vs authoritative, record types (A, AAAA, MX, CNAME, TXT, NS, PTR), recursive vs iterative queries, TTL, DNS caching, DNS poisoning concept.",
    lab:
      "Use dig and nslookup on real domains: dig google.com A, dig MX, dig +trace. TryHackMe \"DNS in Detail\" room.",
    platform: 'TryHackMe',
    platformUrl: 'https://tryhackme.com/room/dnsindetail',
  },
  {
    day: 13,
    pillar: 2,
    title: 'HTTP/HTTPS & common ports',
    theory:
      'HTTP methods (GET/POST/PUT/DELETE/OPTIONS/HEAD), status code families (2xx/3xx/4xx/5xx), key headers (Host, Cookie, Content-Type, Authorization), TLS 1.3 handshake steps, certificate chain. Memorize ports: 21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 3389 RDP.',
    lab:
      'Burp Suite Community: intercept an HTTP request from your browser. Inspect headers, cookies, and manually modify a parameter to observe the response change.',
    platform: 'Burp Suite Community (free)',
    platformUrl: 'https://portswigger.net/burp/communitydownload',
  },
  {
    day: 14,
    pillar: 2,
    title: 'Firewalls, routing & switching',
    theory:
      'How routers use routing tables (ip route show), ARP protocol (MAC-to-IP resolution), switches vs hubs, VLAN concept, stateful vs stateless firewalls, ACL logic, iptables chains (INPUT, OUTPUT, FORWARD) and basic rules.',
    lab:
      'TryHackMe "How the Web Works" + Cisco Packet Tracer: build a small topology with 2 routers, assign subnets, and verify end-to-end connectivity.',
    platform: 'TryHackMe + Cisco Packet Tracer (free)',
    platformUrl: 'https://www.netacad.com/courses/packet-tracer',
  },
  {
    day: 15,
    pillar: 2,
    title: 'Networking review — Wireshark PCAP lab',
    theory:
      'Consolidation day. Redraw the OSI model from memory. Trace a full HTTP request end-to-end: DNS → TCP handshake → HTTP GET → response → TCP FIN. Summarise all protocols encountered this week in your journal.',
    lab:
      'Download a sample PCAP from malware-traffic-analysis.net. Identify source/destination IPs, protocols used, TCP streams, DNS queries, and HTTP URIs.',
    platform: 'malware-traffic-analysis.net',
    platformUrl: 'https://www.malware-traffic-analysis.net/',
  },

  // ─── PILLAR 3: Programming Foundations (Days 16–24) ──────────────────────
  {
    day: 16,
    pillar: 3,
    title: 'Python — syntax & data types',
    theory:
      'Variables, data types (int, str, float, bool, list, dict, tuple, set), print(), input(), type(), f-strings, indexing and slicing, mutability. Write pseudocode on paper before typing — no autocomplete.',
    lab:
      'Write 10 small programs by hand first, then type them: type converter, list reverser, word counter, basic calculator, dict built from two lists.',
    platform: 'Python 3 REPL (built-in, no IDE)',
    platformUrl: 'https://docs.python.org/3/tutorial/',
  },
  {
    day: 17,
    pillar: 3,
    title: 'Python — control flow',
    theory:
      'if/elif/else, for loops, while loops, break/continue/pass, range(), nested loops, boolean operators (and, or, not), short-circuit evaluation, truthiness of different types.',
    lab:
      'Implement from scratch, no AI: FizzBuzz, a number-guessing game with an attempts counter, and a simple arithmetic calculator with input validation.',
    platform: 'Python 3 (offline, no AI)',
    platformUrl: 'https://docs.python.org/3/',
  },
  {
    day: 18,
    pillar: 3,
    title: 'Python — functions & modules',
    theory:
      'def, parameters and defaults, return values, multiple return values (tuples), scope (LEGB rule), *args / **kwargs, import statement, standard library modules: os, sys, pathlib, argparse.',
    lab:
      'Write a file organizer: takes a directory path as a CLI argument, scans files, groups them by extension, and prints a summary. Use only os and sys modules.',
    platform: 'Python 3 (offline)',
    platformUrl: 'https://docs.python.org/3/library/',
  },
  {
    day: 19,
    pillar: 3,
    title: 'Python — file I/O & error handling',
    theory:
      'open() modes (r, w, a, rb), the with statement and why it matters for resource cleanup, read() vs readline() vs readlines(), writing files, try/except/else/finally, exception types (FileNotFoundError, ValueError), raising custom exceptions.',
    lab:
      'Write a log parser: reads a .log file line by line, counts occurrences of ERROR, WARN, and INFO tags, and writes a formatted summary report to a new file.',
    platform: 'Python 3 (offline)',
    platformUrl: 'https://docs.python.org/3/',
  },
  {
    day: 20,
    pillar: 3,
    title: 'Python for security — practical tools',
    theory:
      'socket module (create connection, check if a port is open), requests library (GET/POST, response objects, headers), hashlib (md5, sha256, sha512 digests), how a port scanner or hash cracker works conceptually.',
    lab:
      'Build two tools: (1) a port scanner that checks ports 1–1024 on localhost using socket with a 0.5s timeout; (2) an MD5/SHA256 file hasher with argparse CLI.',
    platform: 'Python 3 (offline)',
    platformUrl: 'https://docs.python.org/3/library/socket.html',
  },
  {
    day: 21,
    pillar: 3,
    title: 'Bash — scripting foundations',
    theory:
      'Shebang line (#!/bin/bash), variables ($VAR, ${VAR}), echo, read, exit codes ($?), arithmetic ($(()), let), conditional test brackets ([ ]), chmod +x, running scripts with ./ vs bash script.sh.',
    lab:
      'Write 3 bash scripts: (1) timestamped backup of a target folder using tar; (2) a system info printer (hostname, IP, uptime, disk usage); (3) a disk alert that warns if usage exceeds 80%.',
    platform: 'Kali Linux VM — bash terminal',
    platformUrl: 'https://www.gnu.org/software/bash/manual/',
  },
  {
    day: 22,
    pillar: 3,
    title: 'Bash — control flow & text processing',
    theory:
      'if/then/else/elif/fi, for loops (C-style and list-based), while/until loops, case statements, string comparisons (-z, -n, ==), file test operators (-f, -d, -e, -r), and using grep/awk/sed within scripts.',
    lab:
      'Script 1: parse /etc/passwd to list all users with UID ≥ 1000. Script 2: tail -f a log file and print an alert line whenever "FAILED LOGIN" appears.',
    platform: 'Kali Linux VM — bash terminal',
    platformUrl: 'https://www.gnu.org/software/bash/',
  },
  {
    day: 23,
    pillar: 3,
    title: 'Bash — automation & security tasks',
    theory:
      'Functions in bash (function name() {}), local variables, cron job syntax (crontab -e), pipes in scripts, set -e (exit on error), set -x (debug trace), heredocs (<<EOF), and background jobs (&).',
    lab:
      'Write a local ping sweep (loop 192.168.1.1–254, print live hosts). Then solve 3 Bandit levels using your own bash scripts instead of typing commands manually.',
    platform: 'OverTheWire Bandit + Kali VM',
    platformUrl: 'https://overthewire.org/wargames/bandit/',
  },
  {
    day: 24,
    pillar: 3,
    title: 'Python + Bash — review & mini-project',
    theory:
      'Reading unfamiliar code (trace execution line by line), commenting for clarity, combining Python and Bash in a pipeline, reviewing your own code for edge cases and error conditions.',
    lab:
      'Mini-project: a Python script that reads /var/log/auth.log (or a sample file), finds all failed SSH login IPs, counts attempts per IP, and prints a ranked report sorted by frequency.',
    platform: 'Python 3 + Kali Linux VM',
    platformUrl: 'https://docs.python.org/3/',
  },

  // ─── PILLAR 4: Security Concepts (Days 25–30) ────────────────────────────
  {
    day: 25,
    pillar: 4,
    title: 'CIA Triad & security fundamentals',
    theory:
      'CIA Triad (Confidentiality, Integrity, Availability) with real breach examples for each. AAA model (Authentication, Authorization, Accounting). Threat actor taxonomy (script kiddie → insider → APT). Attack surface. Defense-in-depth. Principle of least privilege.',
    lab:
      'TryHackMe "Intro to Cybersecurity" room. After each topic, write the definition in your own words with one real-world example.',
    platform: 'TryHackMe',
    platformUrl: 'https://tryhackme.com/room/introtocybersecurity',
  },
  {
    day: 26,
    pillar: 4,
    title: 'Cryptography I — symmetric & hashing',
    theory:
      'Symmetric encryption (AES-128/256, the key distribution problem), asymmetric encryption (RSA conceptually: public/private key pair), hashing vs encryption vs encoding, MD5/SHA-1/SHA-256 digest sizes, collision attacks, and password salting.',
    lab:
      'Python: hash 5 files with hashlib (MD5, SHA256). Then paste an MD5 hash into CrackStation.net and observe it being cracked instantly. Understand why salting defeats this.',
    platform: 'Python 3 + CrackStation.net',
    platformUrl: 'https://crackstation.net/',
  },
  {
    day: 27,
    pillar: 4,
    title: 'Cryptography II — PKI & TLS',
    theory:
      'Public/private key pairs, digital signatures (sign with private key, verify with public key), X.509 certificate structure, Certificate Authorities (CAs), chain of trust, how TLS 1.3 handshake works step-by-step, Perfect Forward Secrecy.',
    lab:
      'TryHackMe "Encryption - Crypto 101". Generate a self-signed certificate: openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem. Inspect it with openssl x509 -text.',
    platform: 'TryHackMe + OpenSSL',
    platformUrl: 'https://tryhackme.com/room/encryptioncrypto101',
  },
  {
    day: 28,
    pillar: 4,
    title: 'Intro offensive concepts & OWASP Top 10',
    theory:
      'Passive OSINT (Google dorking, Shodan, WHOIS) vs active recon (nmap). Vulnerability classes: SQL injection, XSS (stored/reflected), IDOR, path traversal. The attack lifecycle: Recon → Weaponize → Deliver → Exploit → Post-Exploit → Report.',
    lab:
      'TryHackMe "OWASP Top 10 – 2021": complete the SQLi, XSS, and IDOR tasks. Install OWASP Juice Shop locally with Docker for hands-on practice after the room.',
    platform: 'TryHackMe + OWASP Juice Shop',
    platformUrl: 'https://tryhackme.com/room/owasptop102021',
  },
  {
    day: 29,
    pillar: 4,
    title: 'Intro defensive concepts — Blue Team',
    theory:
      'IDS vs IPS (detection vs prevention), SIEM overview (log collection, correlation, alerting), Linux log files (auth.log, syslog), key Windows Event IDs (4624 login, 4625 failed), incident response lifecycle: Prepare → Identify → Contain → Eradicate → Recover → Lessons Learned.',
    lab:
      'TryHackMe "SOC Level 1" intro rooms. Manually grep auth.log for "Failed password" entries and count attempts per source IP.',
    platform: 'TryHackMe SOC Level 1',
    platformUrl: 'https://tryhackme.com/room/jrsecanalystintrouxo',
  },
  {
    day: 30,
    pillar: 4,
    title: 'Capstone review & CTF introduction',
    theory:
      'Final consolidation: draw the full mental model from memory (OS → Network → Code → Security). Create a one-page cheat sheet per pillar. Identify your weakest pillar and plan the next 30 days accordingly.',
    lab:
      'PicoCTF: attempt 5 beginner challenges across General Skills, Cryptography, Forensics, and Web Exploitation. Treat each flag as a test of your Month 1 knowledge.',
    platform: 'PicoCTF (free, always open)',
    platformUrl: 'https://picoctf.org/',
  },
];
