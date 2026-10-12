import { INITIAL_STUDENTS_LIST, INITIAL_APPLICATIONS, INITIAL_DRIVES, INITIAL_COMPANIES } from '../src/lib/mockData';
import { PIPELINE_STAGES } from '../src/types/database.types';

console.log('--- RUNNING PLACEMENT ANALYTICS INTEGRITY CHECKS ---');

// 1. Check all 10 pipeline stages defined and accounted for
console.log('\n[Check 1] Validating 10 Pipeline Stages:');
if (PIPELINE_STAGES.length === 10) {
  console.log('✓ Exactly 10 stages defined in PIPELINE_STAGES:', PIPELINE_STAGES.join(', '));
} else {
  console.error('✗ Expected 10 stages, found', PIPELINE_STAGES.length);
  process.exit(1);
}

// 2. Count application statuses in initial data
const OFFER_STAGES = ['Selected', 'Offer Received', 'Joined'];
const counts: Record<string, number> = {};
PIPELINE_STAGES.forEach(s => counts[s] = 0);

INITIAL_APPLICATIONS.forEach(a => {
  let stage = a.status;
  if (stage === 'Applied') stage = 'Registered';
  if (stage === 'Interviewing') stage = 'Interview in Progress';
  if (counts[stage] !== undefined) {
    counts[stage]++;
  }
});

console.log('\n[Check 2] Stage Distribution in Applications Dataset:');
Object.entries(counts).forEach(([stage, count]) => {
  console.log(`  - ${stage.padEnd(25)}: ${count}`);
});

// Verify every stage has representation
const missingStages = PIPELINE_STAGES.filter(s => counts[s] === 0);
if (missingStages.length === 0) {
  console.log('✓ All 10 stages have active records in the initial dataset.');
} else {
  console.warn('! Some stages have 0 records:', missingStages);
}

// 3. Multi-offer integrity check (Data Accuracy Rule)
console.log('\n[Check 3] Multi-Offer vs Unique Students Placed:');
const studentOfferMap = new Map<string, number>();

INITIAL_APPLICATIONS.forEach(a => {
  if (OFFER_STAGES.includes(a.status)) {
    const cur = studentOfferMap.get(a.student_id) || 0;
    studentOfferMap.set(a.student_id, cur + 1);
  }
});

INITIAL_STUDENTS_LIST.forEach(s => {
  if (s.placement_status === 'Placed' && !studentOfferMap.has(s.id)) {
    studentOfferMap.set(s.id, 1);
  }
});

const uniquePlacedCount = studentOfferMap.size;
let totalOffers = 0;
let multipleOfferHolders = 0;
studentOfferMap.forEach((count, sId) => {
  totalOffers += count;
  if (count > 1) {
    multipleOfferHolders++;
    const s = INITIAL_STUDENTS_LIST.find(st => st.id === sId);
    console.log(`  Student with multiple offers: ${s?.profile?.full_name || sId} (${count} offers)`);
  }
});

console.log(`  Total Offers Generated     : ${totalOffers}`);
console.log(`  Unique Placed Students      : ${uniquePlacedCount}`);
console.log(`  Students with 2+ Offers     : ${multipleOfferHolders}`);

if (totalOffers > uniquePlacedCount) {
  console.log('✓ Successfully verified: Total offers exceeds unique placed count without double-counting students!');
} else {
  console.error('✗ Total offers should exceed unique placed count');
  process.exit(1);
}

// 4. Department Analytics check
console.log('\n[Check 4] Department Analytics Validation:');
const departments = Array.from(new Set(INITIAL_STUDENTS_LIST.map(s => s.department)));
console.log(`  Distinct Departments (${departments.length}):`, departments.join(', '));
departments.forEach(dept => {
  const deptStudents = INITIAL_STUDENTS_LIST.filter(s => s.department === dept);
  const deptPlaced = deptStudents.filter(s => studentOfferMap.has(s.id));
  const rate = Math.round((deptPlaced.length / deptStudents.length) * 100);
  console.log(`  - ${dept.padEnd(35)}: ${deptStudents.length} students | ${deptPlaced.length} placed (${rate}%)`);
});

console.log('\n--- ALL ANALYTICS INTEGRITY TESTS PASSED SUCCESSFULLY ---\n');
