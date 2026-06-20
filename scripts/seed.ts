/**
 * scripts/seed.ts
 * Run with: npm run seed (uses tsx)
 * 
 * Seeds the exercises table from workoutplan.ts
 * and the study_days table from studyPlan.js.
 * 
 * Idempotent — uses ON CONFLICT DO NOTHING.
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ── Exercise data (from workoutplan.ts) ────────────────────────────────────

interface ExerciseSeed {
  slug: string;
  name: string;
  day_type: 'push' | 'pull' | 'legs';
  target_sets: number;
  target_reps: string;
  notes: string;
  is_main_lift: boolean;
  sort_order: number;
}

const exercises: ExerciseSeed[] = [
  // Pull Day (Mon/Thu)
  { slug: 'weighted_pull_ups',    name: 'Weighted Pull-Ups',              day_type: 'pull', target_sets: 2, target_reps: '5-6',    notes: 'Set 1: +10kg (leave 1 rep in tank). Set 2: +15kg to absolute failure.', is_main_lift: true,  sort_order: 1 },
  { slug: 'dumbbell_rows',        name: 'Dumbbell Rows',                  day_type: 'pull', target_sets: 2, target_reps: '7-8',    notes: 'Start with Left Arm. Match the exact reps with Right Arm. (Current: 25kg)', is_main_lift: false, sort_order: 2 },
  { slug: 'rack_pulls',           name: 'Rack Pulls',                     day_type: 'pull', target_sets: 3, target_reps: '6',      notes: 'Warm up 60kg -> 100kg. Top working set: 120kg. Protect lower back.', is_main_lift: true,  sort_order: 3 },
  { slug: 'ez_bar_bicep_curls',   name: 'EZ Bar Bicep Curls',             day_type: 'pull', target_sets: 2, target_reps: '7-8',    notes: 'Heavy. (Current: 12.5kg each side).', is_main_lift: false, sort_order: 4 },
  { slug: 'arm_wrestling_hook',   name: 'Arm Wrestling — Hook',           day_type: 'pull', target_sets: 2, target_reps: '5-8',    notes: 'Heavy cable curls. Prioritize supination and cup.', is_main_lift: false, sort_order: 5 },
  { slug: 'arm_wrestling_riser',  name: 'Arm Wrestling — Riser',          day_type: 'pull', target_sets: 2, target_reps: '5-8',    notes: 'Cable hammer curls with static hold on last rep. Prioritize back pressure and radial deviation.', is_main_lift: false, sort_order: 6 },

  // Push Day (Tue/Fri)
  { slug: 'incline_bench',        name: 'Incline Barbell Bench',          day_type: 'push', target_sets: 2, target_reps: '3-5',    notes: 'Warm up with external/internal rotations + pushups. Top set: 15kg plates each side.', is_main_lift: true,  sort_order: 1 },
  { slug: 'weighted_dips',        name: 'Weighted Dips',                  day_type: 'push', target_sets: 2, target_reps: '2-3',    notes: 'Hit these while shoulders are fresh! Prioritize stability and heavy weight.', is_main_lift: true,  sort_order: 2 },
  { slug: 'incline_db_press',     name: 'Incline Dumbbell Press',         day_type: 'push', target_sets: 2, target_reps: '7',      notes: 'Deep stretch at the bottom. (Current: 20kg, aiming for 22.5kg).', is_main_lift: false, sort_order: 3 },
  { slug: 'cable_lateral_raises', name: 'Cable Lateral Raises',           day_type: 'push', target_sets: 2, target_reps: '6-11',   notes: 'If cable taken, use seated dumbbells. 5kg x 11 -> 7.5kg x 7.', is_main_lift: false, sort_order: 4 },
  { slug: 'cable_tricep_ext',     name: 'Cable Tricep Extensions',        day_type: 'push', target_sets: 2, target_reps: 'Failure', notes: 'AUTO-REGULATE: Only do this if CNS is firing and you feel energetic. (40kg+).', is_main_lift: false, sort_order: 5 },

  // Leg Day (Wed/Sat)
  { slug: 'hack_squats',          name: 'Hack Squats',                    day_type: 'legs', target_sets: 2, target_reps: 'Failure', notes: 'The atomic bomb for quads. Keep lower back pinned to the pad.', is_main_lift: true,  sort_order: 1 },
  { slug: 'dumbbell_rdls',        name: 'Dumbbell RDLs',                  day_type: 'legs', target_sets: 2, target_reps: '8-10',   notes: 'CRITICAL: Added for hamstring and glute thickness. Heavy stretch.', is_main_lift: false, sort_order: 2 },
  { slug: 'leg_extensions',       name: 'Leg Extensions',                 day_type: 'legs', target_sets: 2, target_reps: 'Failure', notes: 'Burn out the quads completely.', is_main_lift: false, sort_order: 3 },
  { slug: 'seated_leg_curls',     name: 'Seated Leg Curls',               day_type: 'legs', target_sets: 2, target_reps: '9-12',   notes: 'Heavy constant tension.', is_main_lift: false, sort_order: 4 },
  { slug: 'cable_side_kicks',     name: 'Standing Cable Side-Kicks',      day_type: 'legs', target_sets: 2, target_reps: '10-12',  notes: 'Replaces broken abductor machine. Strap to ankle, kick outward.', is_main_lift: false, sort_order: 5 },
  { slug: 'ab_crunch_machine',    name: 'Weighted Ab Crunch Machine',     day_type: 'legs', target_sets: 2, target_reps: 'Failure', notes: 'Round the spine, contract hard. Treat abs like heavy compounds.', is_main_lift: false, sort_order: 6 },
];

// ── Study day data (from studyPlan.js) ─────────────────────────────────────

interface StudyDaySeed {
  day_number: number;
  pillar: number;
  title: string;
  description: string;
}

const studyDays: StudyDaySeed[] = [
  { day_number: 1,  pillar: 1, title: 'Linux — filesystem & navigation',             description: 'Linux history, FHS, essential commands: ls, cd, pwd, mkdir, rm, cp, mv, cat, less, man.' },
  { day_number: 2,  pillar: 1, title: 'Linux — file permissions & users',             description: 'chmod, chown, rwx model, SUID/SGID/sticky bit, sudo, /etc/passwd, /etc/shadow.' },
  { day_number: 3,  pillar: 1, title: 'Linux — processes & text manipulation',        description: 'ps aux, top/htop, kill, pipes, grep, sort, uniq, cut, tr, wc. stdin/stdout/stderr.' },
  { day_number: 4,  pillar: 1, title: 'Linux — networking commands & packages',       description: 'ip addr, netstat, ss, ping, traceroute, curl, wget, nmap basics, apt.' },
  { day_number: 5,  pillar: 1, title: 'Linux — shell environment & variables',        description: '.bashrc vs .bash_profile, env vars, aliases, history, shell expansion.' },
  { day_number: 6,  pillar: 1, title: 'Windows internals basics',                     description: 'Registry, Task Manager, Services, Event Viewer, NTFS ACLs, UAC, PowerShell basics.' },
  { day_number: 7,  pillar: 1, title: 'Virtualization & lab setup',                   description: 'Hypervisors, VirtualBox, VM networking, snapshots. Install Kali Linux.' },
  { day_number: 8,  pillar: 2, title: 'OSI model deep dive',                          description: 'All 7 layers, PDU names, encapsulation, protocol mapping per layer.' },
  { day_number: 9,  pillar: 2, title: 'TCP/IP model & the 3-way handshake',           description: 'TCP vs UDP, SYN/SYN-ACK/ACK, TCP flags, sequence numbers, IPv4 vs IPv6.' },
  { day_number: 10, pillar: 2, title: 'IP addressing & subnetting I',                 description: 'IPv4 structure, address classes, private vs public, CIDR, subnet masks.' },
  { day_number: 11, pillar: 2, title: 'Subnetting II & NAT',                          description: 'VLSM, usable host calculation, default gateway, NAT vs PAT.' },
  { day_number: 12, pillar: 2, title: "DNS — the internet's phone book",              description: 'DNS hierarchy, record types (A, AAAA, MX, CNAME, TXT), recursive vs iterative, TTL.' },
  { day_number: 13, pillar: 2, title: 'HTTP/HTTPS & common ports',                    description: 'HTTP methods, status codes, TLS 1.3, common ports (21/22/23/25/53/80/443/3389).' },
  { day_number: 14, pillar: 2, title: 'Firewalls, routing & switching',               description: 'Routing tables, ARP, VLANs, stateful vs stateless firewalls, iptables.' },
  { day_number: 15, pillar: 2, title: 'Networking review — Wireshark PCAP lab',        description: 'Consolidation. Trace HTTP request end-to-end. Analyse PCAP files.' },
  { day_number: 16, pillar: 3, title: 'Python — syntax & data types',                 description: 'Variables, data types, f-strings, indexing, slicing, mutability.' },
  { day_number: 17, pillar: 3, title: 'Python — control flow',                        description: 'if/elif/else, loops, break/continue, range(), boolean operators.' },
  { day_number: 18, pillar: 3, title: 'Python — functions & modules',                 description: 'def, parameters, scope (LEGB), *args/**kwargs, import, standard library.' },
  { day_number: 19, pillar: 3, title: 'Python — file I/O & error handling',           description: 'open() modes, with statement, try/except/finally, exception types.' },
  { day_number: 20, pillar: 3, title: 'Python for security — practical tools',        description: 'socket module, requests, hashlib. Build port scanner and file hasher.' },
  { day_number: 21, pillar: 3, title: 'Bash — scripting foundations',                 description: 'Shebang, variables, echo, exit codes, arithmetic, conditionals, chmod +x.' },
  { day_number: 22, pillar: 3, title: 'Bash — control flow & text processing',        description: 'if/then/fi, for/while loops, case, string/file tests, grep/awk/sed.' },
  { day_number: 23, pillar: 3, title: 'Bash — automation & security tasks',           description: 'Functions, cron, set -e/-x, heredocs, background jobs. Ping sweep script.' },
  { day_number: 24, pillar: 3, title: 'Python + Bash — review & mini-project',        description: 'Read unfamiliar code, combine Python+Bash. Build SSH log analyser.' },
  { day_number: 25, pillar: 4, title: 'CIA Triad & security fundamentals',            description: 'CIA Triad, AAA model, threat actors, attack surface, defense-in-depth, least privilege.' },
  { day_number: 26, pillar: 4, title: 'Cryptography I — symmetric & hashing',         description: 'AES, RSA concept, hashing vs encryption, MD5/SHA, collision attacks, salting.' },
  { day_number: 27, pillar: 4, title: 'Cryptography II — PKI & TLS',                  description: 'Key pairs, digital signatures, X.509 certs, CAs, TLS 1.3, PFS.' },
  { day_number: 28, pillar: 4, title: 'Intro offensive concepts & OWASP Top 10',      description: 'OSINT, nmap, SQLi, XSS, IDOR, path traversal. Attack lifecycle.' },
  { day_number: 29, pillar: 4, title: 'Intro defensive concepts — Blue Team',         description: 'IDS/IPS, SIEM, log analysis, key Event IDs, incident response lifecycle.' },
  { day_number: 30, pillar: 4, title: 'Capstone review & CTF introduction',           description: 'Final consolidation. One-page cheat sheet per pillar. PicoCTF challenges.' },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Seed exercises
  let exerciseCount = 0;
  for (const ex of exercises) {
    const result = await sql`
      INSERT INTO exercises (slug, name, day_type, target_sets, target_reps, notes, is_main_lift, sort_order)
      VALUES (${ex.slug}, ${ex.name}, ${ex.day_type}, ${ex.target_sets}, ${ex.target_reps}, ${ex.notes}, ${ex.is_main_lift}, ${ex.sort_order})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        day_type = EXCLUDED.day_type,
        target_sets = EXCLUDED.target_sets,
        target_reps = EXCLUDED.target_reps,
        notes = EXCLUDED.notes,
        is_main_lift = EXCLUDED.is_main_lift,
        sort_order = EXCLUDED.sort_order
      RETURNING slug
    `;
    exerciseCount++;
  }
  console.log(`  ✓ ${exerciseCount} exercises seeded`);

  // Seed study days
  let studyCount = 0;
  for (const day of studyDays) {
    await sql`
      INSERT INTO study_days (day_number, pillar, title, description)
      VALUES (${day.day_number}, ${day.pillar}, ${day.title}, ${day.description})
      ON CONFLICT (day_number) DO UPDATE SET
        pillar = EXCLUDED.pillar,
        title = EXCLUDED.title,
        description = EXCLUDED.description
    `;
    studyCount++;
  }
  console.log(`  ✓ ${studyCount} study days seeded`);

  console.log('\n✅ Seed complete.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
