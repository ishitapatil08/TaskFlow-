
# TaskFlow E2E Test Script
# Run: powershell -ExecutionPolicy Bypass -File e2e-test.ps1

$BASE = "https://taskflow-65nm.onrender.com/api"
$SLUG = "test-org-$(Get-Random -Maximum 999999)"
$EMAIL = "test-$((Get-Random -Maximum 99999))@taskflow.com"
$PASS  = "Test1234!"

function Invoke-API {
  param($Method, $Path, $Body = $null, $Token = $null)
  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  try {
    $params = @{ Uri = "$BASE$Path"; Method = $Method; Headers = $headers; TimeoutSec = 30 }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
    $res = Invoke-RestMethod @params
    return $res
  } catch {
    $raw = $_.ErrorDetails.Message
    Write-Host "  ERROR $($_.Exception.Message)"
    if ($raw) { Write-Host "  BODY: $raw" }
    return $null
  }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TaskFlow API - End-to-End Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Base URL : $BASE"
Write-Host "  Email    : $EMAIL"
Write-Host "  OrgSlug  : $SLUG"
Write-Host ""

# --- STEP 1: Health Check ---
Write-Host "[1/8] Health Check..." -ForegroundColor Yellow
$health = Invoke-API -Method GET -Path "/../health"
if ($health.status -eq "ok") {
  Write-Host "  ✅ Server is healthy: $($health.timestamp)" -ForegroundColor Green
} else {
  Write-Host "  ❌ Health check failed" -ForegroundColor Red
}

# --- STEP 2: Register ---
Write-Host ""
Write-Host "[2/8] POST /auth/register ..." -ForegroundColor Yellow
$reg = Invoke-API -Method POST -Path "/auth/register" -Body @{
  email = $EMAIL; password = $PASS; name = "Test User"
  orgName = "Test Organization"; orgSlug = $SLUG
}
if ($reg) {
  Write-Host "  ✅ Registered: $($reg.data.user.email)" -ForegroundColor Green
  Write-Host "     OrgId    : $($reg.data.organization.id)"
  Write-Host "     Token    : $($reg.data.tokens.accessToken.Substring(0,30))..."
  $ACCESS  = $reg.data.tokens.accessToken
  $REFRESH = $reg.data.tokens.refreshToken
  $ORG_ID  = $reg.data.organization.id
} else {
  Write-Host "  ❌ Register failed" -ForegroundColor Red
  exit 1
}

# --- STEP 3: Login ---
Write-Host ""
Write-Host "[3/8] POST /auth/login ..." -ForegroundColor Yellow
$login = Invoke-API -Method POST -Path "/auth/login" -Body @{
  email = $EMAIL; password = $PASS; orgSlug = $SLUG
}
if ($login) {
  Write-Host "  ✅ Login successful" -ForegroundColor Green
  Write-Host "     Role: $($login.data.organization.role)"
  $ACCESS = $login.data.tokens.accessToken
} else {
  Write-Host "  ❌ Login failed" -ForegroundColor Red
}

# --- STEP 4: Create Project ---
Write-Host ""
Write-Host "[4/8] POST /projects ..." -ForegroundColor Yellow
$proj = Invoke-API -Method POST -Path "/projects" -Token $ACCESS -Body @{
  name = "E2E Test Project"
  description = "Automated test project"
}
if ($proj) {
  Write-Host "  ✅ Project created: $($proj.data.name)" -ForegroundColor Green
  Write-Host "     ProjectId: $($proj.data.id)"
  $PROJECT_ID = $proj.data.id
} else {
  Write-Host "  ❌ Create project failed" -ForegroundColor Red
}

# --- STEP 5: Create Task ---
Write-Host ""
Write-Host "[5/8] POST /tasks ..." -ForegroundColor Yellow
$due = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ssZ")
$task = Invoke-API -Method POST -Path "/tasks" -Token $ACCESS -Body @{
  title = "E2E Test Task"
  description = "Task created by automated test"
  projectId = $PROJECT_ID
  priority = "HIGH"
  dueDate = $due
}
if ($task) {
  Write-Host "  ✅ Task created: $($task.data.title)" -ForegroundColor Green
  Write-Host "     TaskId  : $($task.data.id)"
  Write-Host "     Priority: $($task.data.priority)"
  $TASK_ID = $task.data.id
} else {
  Write-Host "  ❌ Create task failed" -ForegroundColor Red
}

# --- STEP 6: List Tasks ---
Write-Host ""
Write-Host "[6/8] GET /tasks?projectId=... ..." -ForegroundColor Yellow
$tasks = Invoke-API -Method GET -Path "/tasks?projectId=$PROJECT_ID&page=1&limit=10" -Token $ACCESS
if ($tasks) {
  Write-Host "  ✅ Tasks listed: $($tasks.data.tasks.Count) task(s), total=$($tasks.data.total)" -ForegroundColor Green
} else {
  Write-Host "  ❌ List tasks failed" -ForegroundColor Red
}

# --- STEP 7: Update Task Status ---
Write-Host ""
Write-Host "[7/8] PATCH /tasks/$TASK_ID/status ..." -ForegroundColor Yellow
$update = Invoke-API -Method PATCH -Path "/tasks/$TASK_ID/status" -Token $ACCESS -Body @{ status = "IN_PROGRESS" }
if ($update) {
  Write-Host "  ✅ Status updated: $($update.data.status)" -ForegroundColor Green
} else {
  Write-Host "  ❌ Status update failed" -ForegroundColor Red
}

# --- STEP 8: Dashboard Stats ---
Write-Host ""
Write-Host "[8/8] GET /tasks/dashboard/stats ..." -ForegroundColor Yellow
$stats = Invoke-API -Method GET -Path "/tasks/dashboard/stats" -Token $ACCESS
if ($stats) {
  Write-Host "  ✅ Dashboard stats:" -ForegroundColor Green
  $stats | ConvertTo-Json -Depth 3
} else {
  Write-Host "  ❌ Dashboard stats failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  E2E Test Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "COPY THIS FOR YOUR SUBMISSION:" -ForegroundColor Yellow
Write-Host "  Live URL   : https://taskflow-api.onrender.com" -ForegroundColor White
Write-Host "  Swagger    : https://taskflow-api.onrender.com/api-docs" -ForegroundColor White
Write-Host "  GitHub     : https://github.com/ishitapatil08/TaskFlow-" -ForegroundColor White
