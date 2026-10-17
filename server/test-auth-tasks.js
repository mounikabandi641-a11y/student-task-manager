/**
 * Automated Multi-Student Security & Ownership Test Suite
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING MULTI-STUDENT SECURITY & OWNERSHIP TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Unauthenticated access to /api/tasks must return 401
    console.log('--- TEST 1: Unauthenticated API Access Protection ---');
    const unauthTasksRes = await fetch(`${BASE_URL}/tasks`);
    assert(unauthTasksRes.status === 401, 'GET /api/tasks without token returns 401 Unauthorized');

    const unauthDashRes = await fetch(`${BASE_URL}/dashboard`);
    assert(unauthDashRes.status === 401, 'GET /api/dashboard without token returns 401 Unauthorized');

    // TEST 2: Invalid Credentials Rejection
    console.log('\n--- TEST 2: Authentication Credentials Validation ---');
    const invalidLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'wrongpassword' })
    });
    assert(invalidLoginRes.status === 401, 'POST /api/auth/login with wrong password returns 401');

    // TEST 3: Successful Login of Existing Student (Alex Rivera)
    console.log('\n--- TEST 3: Existing Student Login ---');
    const alexLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' })
    });
    const alexLoginData = await alexLoginRes.json();
    assert(alexLoginRes.status === 200, 'POST /api/auth/login with correct password returns 200');
    assert(!!alexLoginData.token, 'Response includes valid JWT token');
    assert(alexLoginData.user.name === 'Alex Rivera', 'Student name is Alex Rivera');
    const alexToken = alexLoginData.token;

    // TEST 4: Duplicate Email Rejection
    console.log('\n--- TEST 4: Duplicate Email Validation ---');
    const duplicateRegisterRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Alex',
        email: 'student@example.com',
        password: 'password456'
      })
    });
    assert(duplicateRegisterRes.status === 409, 'POST /api/auth/register with existing email returns 409 Conflict');

    // TEST 5: Registration of New Student (Bianca Chen)
    console.log('\n--- TEST 5: New Student Registration ---');
    const uniqueEmail = `bianca_${Date.now()}@university.edu`;
    const biancaRegisterRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bianca Chen',
        email: uniqueEmail,
        password: 'securePass123'
      })
    });
    const biancaRegisterData = await biancaRegisterRes.json();
    assert(biancaRegisterRes.status === 201, 'POST /api/auth/register with unique email returns 201');
    assert(!!biancaRegisterData.token, 'Bianca receives valid JWT token upon registration');
    const biancaToken = biancaRegisterData.token;

    // TEST 6: Student A (Alex) Tasks Retrieval
    console.log('\n--- TEST 6: Student A Task Data Integrity ---');
    const alexTasksRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${alexToken}` }
    });
    const alexTasksData = await alexTasksRes.json();
    assert(alexTasksRes.status === 200, 'Alex can retrieve own tasks');
    assert(alexTasksData.data.length >= 6, `Alex has pre-existing seed tasks (count: ${alexTasksData.data.length})`);
    const alexTaskId = alexTasksData.data[0].id;

    // TEST 7: Student B (Bianca) Starts With Clean Isolated Dashboard
    console.log('\n--- TEST 7: Student B Task Isolation ---');
    const biancaTasksRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${biancaToken}` }
    });
    const biancaTasksData = await biancaTasksRes.json();
    assert(biancaTasksRes.status === 200, 'Bianca can fetch her tasks');
    assert(biancaTasksData.data.length === 0, 'Bianca starts with 0 tasks (isolated from Alex)');

    // TEST 8: Student B Creates a Task
    console.log('\n--- TEST 8: Student B Task Creation ---');
    const biancaCreateRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${biancaToken}`
      },
      body: JSON.stringify({
        title: 'Bianca Genetics Research Paper',
        subject: 'Biology 201',
        priority: 'High',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        status: 'In Progress'
      })
    });
    const biancaCreateData = await biancaCreateRes.json();
    assert(biancaCreateRes.status === 201, 'Bianca creates her task successfully');
    const biancaTaskId = biancaCreateData.data.id;

    // TEST 9: Cross-User Security — Bianca CANNOT Read Alex's Task
    console.log('\n--- TEST 9: Cross-User Security (Unauthorized Read) ---');
    const crossReadRes = await fetch(`${BASE_URL}/tasks/${alexTaskId}`, {
      headers: { 'Authorization': `Bearer ${biancaToken}` }
    });
    assert(crossReadRes.status === 404, `Bianca cannot read Alex's task (ID: ${alexTaskId}) -> 404/Denied`);

    // TEST 10: Cross-User Security — Bianca CANNOT Update Alex's Task
    console.log('\n--- TEST 10: Cross-User Security (Unauthorized Update) ---');
    const crossUpdateRes = await fetch(`${BASE_URL}/tasks/${alexTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${biancaToken}`
      },
      body: JSON.stringify({ title: 'Hacked by Bianca' })
    });
    assert(crossUpdateRes.status === 404, `Bianca cannot update Alex's task (ID: ${alexTaskId}) -> 404/Denied`);

    // TEST 11: Cross-User Security — Bianca CANNOT Delete Alex's Task
    console.log('\n--- TEST 11: Cross-User Security (Unauthorized Delete) ---');
    const crossDeleteRes = await fetch(`${BASE_URL}/tasks/${alexTaskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${biancaToken}` }
    });
    assert(crossDeleteRes.status === 404, `Bianca cannot delete Alex's task (ID: ${alexTaskId}) -> 404/Denied`);

    // Verify Alex's task was NOT modified or deleted
    const verifyAlexTask = await fetch(`${BASE_URL}/tasks/${alexTaskId}`, {
      headers: { 'Authorization': `Bearer ${alexToken}` }
    });
    const verifyAlexData = await verifyAlexTask.json();
    assert(verifyAlexTask.status === 200, "Alex's task still exists intact");
    assert(!verifyAlexData.data.title.includes('Hacked'), "Alex's task title was not altered");

    // TEST 12: Dashboard Statistics Isolation
    console.log('\n--- TEST 12: Dashboard Statistics Scoping ---');
    const alexDashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { 'Authorization': `Bearer ${alexToken}` }
    });
    const alexDashData = await alexDashRes.json();

    const biancaDashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { 'Authorization': `Bearer ${biancaToken}` }
    });
    const biancaDashData = await biancaDashRes.json();

    assert(alexDashData.data.totalTasks >= 6, `Alex dashboard counts reflect his own tasks (${alexDashData.data.totalTasks})`);
    assert(biancaDashData.data.totalTasks === 1, `Bianca dashboard counts reflect ONLY her own tasks (${biancaDashData.data.totalTasks})`);

    // TEST 13: System Health Check Remains Accessible
    console.log('\n--- TEST 13: System Health Endpoint ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health is accessible');
    assert(!!healthData.data.mode, `Health reports database mode: ${healthData.data.mode}`);

    console.log('\n======================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  }
}

runTests();
