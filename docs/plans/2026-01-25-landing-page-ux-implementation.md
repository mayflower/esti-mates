# Landing Page UX Improvement - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate double name entry by splitting Landing Page into two separate forms and passing name via navigation state for Create flow.

**Architecture:** Two independent forms on Landing Page (Create and Join). Create flow passes name through navigation state to SessionPage for auto-join. Join flow keeps current behavior (name prompt on SessionPage).

**Tech Stack:** React, TypeScript, Styled Components, React Router

---

## Task 1: Refactor LandingPage Component Structure

**Files:**
- Modify: `frontend/src/components/LandingPage.tsx:107-160`

### Step 1: Add SectionTitle styled component

Add after the `Button` styled component definition (after line 71):

```tsx
const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.md};
  font-size: 1.25rem;
  text-align: center;
  font-weight: 600;
`;
```

**Why:** Visual hierarchy to distinguish the two forms.

### Step 2: Split state into two separate variables

Replace the state declarations (lines 107-108):

**Old:**
```tsx
const [name, setName] = useState("");
const [sessionId, setSessionId] = useState("");
```

**New:**
```tsx
const [createName, setCreateName] = useState("");
const [joinSessionId, setJoinSessionId] = useState("");
```

**Why:** Separate state prevents coupling between the two forms.

### Step 3: Update handleCreate function

Replace the `handleCreate` function (lines 112-118):

**New:**
```tsx
const handleCreate = () => {
  if (!createName.trim()) {
    alert("Please enter your name");
    return;
  }
  onCreateSession(createName.trim());
};
```

**Why:** Now validates only createName, not the shared name variable.

### Step 4: Update handleJoin function

Replace the `handleJoin` function (lines 120-130):

**New:**
```tsx
const handleJoin = () => {
  if (!joinSessionId.trim()) {
    alert("Please enter a session ID");
    return;
  }
  // No name validation here!
  navigate(`/session/${joinSessionId.trim().toUpperCase()}`);
};
```

**Why:** Removes name validation, only validates Session ID. User enters name on Session Page.

### Step 5: Restructure JSX into two separate Cards

Replace the JSX return statement (lines 132-159):

**New:**
```tsx
return (
  <Container>
    {branding.brandLogoUrl && <Logo src={branding.brandLogoUrl} alt={branding.brandName} />}
    <Title>MF EstiMates</Title>

    {/* Form 1: Create New Session */}
    <Card>
      <SectionTitle>Create New Session</SectionTitle>
      <Input
        type="text"
        placeholder="Your name"
        value={createName}
        onChange={(e) => setCreateName(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleCreate()}
        maxLength={50}
      />
      <Button onClick={handleCreate}>Create New Session</Button>
    </Card>

    <Divider>or</Divider>

    {/* Form 2: Join Existing Session */}
    <Card>
      <SectionTitle>Join Existing Session</SectionTitle>
      <Input
        type="text"
        placeholder="Session ID (6 characters)"
        value={joinSessionId}
        onChange={(e) => setJoinSessionId(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleJoin()}
        maxLength={6}
      />
      <Button onClick={handleJoin}>Join Existing Session</Button>
    </Card>

    <Footer>{branding.brandFooterText}</Footer>
  </Container>
);
```

**Why:** Two visually distinct Cards make it clear which inputs belong to which action.

### Step 6: Verify component compiles

Run: `npm run build --workspace=frontend`

Expected: Build succeeds with no TypeScript errors.

### Step 7: Commit

```bash
git add frontend/src/components/LandingPage.tsx
git commit -m "refactor: split Landing Page into two separate forms

- Add SectionTitle styled component for visual hierarchy
- Split state: createName and joinSessionId
- Update handlers: handleCreate validates only name, handleJoin only session ID
- Restructure JSX: two separate Cards with clear visual separation"
```

---

## Task 2: Update LandingPage Tests

**Files:**
- Modify: `frontend/src/components/LandingPage.test.tsx`

### Step 1: Read existing test file

Read: `frontend/src/components/LandingPage.test.tsx`

**Why:** Understand current test structure before modifying.

### Step 2: Update test to match new form structure

The tests need to be updated to work with the two separate forms. Specifically:

**Change needed:**
- Find input by placeholder "Your name" in Create form
- Find input by placeholder "Session ID (6 characters)" in Join form
- Update assertions to work with separate state variables

### Step 3: Run tests to verify they pass

Run: `npm run test:ci --workspace=frontend`

Expected: All tests pass.

**If tests fail:** Fix the test implementation to match the new component structure.

### Step 4: Commit

```bash
git add frontend/src/components/LandingPage.test.tsx
git commit -m "test: update LandingPage tests for two-form structure"
```

---

## Task 3: Update App.tsx to Pass Name via Navigation State

**Files:**
- Modify: `frontend/src/App.tsx:11-27`

### Step 1: Capture name in LandingPageWrapper

Modify the `LandingPageWrapper` component to store the name when creating session:

**Replace lines 11-27:**

```tsx
function LandingPageWrapper() {
  const navigate = useNavigate();
  const { createSession, sessionId } = useSession();
  const [creatorName, setCreatorName] = React.useState<string | null>(null);

  const handleCreateSession = (name: string) => {
    setCreatorName(name);
    createSession(name);
  };

  // Navigate when session is created, passing name via state
  React.useEffect(() => {
    if (sessionId && creatorName) {
      navigate(`/session/${sessionId}`, {
        state: { name: creatorName, isModerator: true },
      });
    }
  }, [sessionId, creatorName, navigate]);

  return <LandingPage onCreateSession={handleCreateSession} />;
}
```

**Why:** Store the name temporarily so we can pass it via navigation state when sessionId becomes available.

### Step 2: Verify component compiles

Run: `npm run build --workspace=frontend`

Expected: Build succeeds with no TypeScript errors.

### Step 3: Commit

```bash
git add frontend/src/App.tsx
git commit -m "feat: pass creator name via navigation state

- Store name in LandingPageWrapper state
- Pass name and isModerator flag via navigate state
- Enables auto-join on SessionPage without second name prompt"
```

---

## Task 4: Update SessionPage to Auto-Join with Navigation State

**Files:**
- Modify: `frontend/src/pages/SessionPage.tsx:1-10,105-130,164-181`

### Step 1: Import useLocation hook

Add to imports (line 3):

```tsx
import { useParams, useLocation } from "react-router-dom";
```

### Step 2: Read navigation state in SessionPage

Add after the `useParams` call (after line 106):

```tsx
const location = useLocation();
const { name: nameFromState, isModerator: isModeratorFromState } =
  (location.state as { name?: string; isModerator?: boolean }) || {};
```

**Why:** Extract name and moderator status from navigation state if present.

### Step 3: Add auto-join effect

Add new useEffect after the existing useEffect (after line 130):

```tsx
useEffect(() => {
  // Auto-join if name was passed from Landing Page (Create flow)
  if (nameFromState && urlSessionId && !joined) {
    joinSession(urlSessionId, nameFromState, isModeratorFromState);
  }
}, [nameFromState, urlSessionId, joined, joinSession, isModeratorFromState]);
```

**Why:** Automatically join session if name was provided from Create flow.

### Step 4: Update join prompt condition

Modify the join prompt condition (line 164):

**Old:**
```tsx
if (!joined) {
```

**New:**
```tsx
if (!joined && !nameFromState) {
```

**Why:** Don't show join prompt if we're auto-joining with navigation state.

### Step 5: Verify component compiles

Run: `npm run build --workspace=frontend`

Expected: Build succeeds with no TypeScript errors.

### Step 6: Run all tests

Run: `npm run test:ci --workspace=frontend && npm run test:ci --workspace=backend`

Expected: All tests pass (81 tests).

### Step 7: Commit

```bash
git add frontend/src/pages/SessionPage.tsx
git commit -m "feat: auto-join session when name provided via navigation state

- Import and use useLocation to read navigation state
- Auto-join effect when name is present
- Skip join prompt for auto-join flow
- Enables seamless Create flow without double name entry"
```

---

## Task 5: Manual Testing

**Files:**
- None (manual verification)

### Step 1: Start dev server

Run: `npm run dev:frontend`

Wait for: "Local: http://localhost:5173/"

### Step 2: Test Create New Session flow

**Actions:**
1. Open browser to `http://localhost:5173/`
2. Enter "Test User" in the "Create New Session" form name field
3. Click "Create New Session" button
4. Verify: Redirected to `/session/XXXXXX` page
5. Verify: NO name prompt shown (auto-joined as moderator)
6. Verify: User appears in participant list as "Test User" with moderator badge

**Expected:** User enters name once, joins immediately without second prompt.

### Step 3: Test Join with Code flow

**Actions:**
1. Open browser to `http://localhost:5173/`
2. Enter only "ABC123" in the "Join Existing Session" form (no name field visible)
3. Click "Join Existing Session" button
4. Verify: Redirected to `/session/ABC123` page
5. Verify: Name prompt IS shown
6. Enter "Participant Name" and click Join
7. Verify: User appears in participant list as "Participant Name"

**Expected:** User enters Session ID on Landing Page, enters name on Session Page.

### Step 4: Test Join with Direct Link flow

**Actions:**
1. Copy a session URL (from step 2 or create new session)
2. Open new browser tab
3. Paste URL directly: `http://localhost:5173/session/ABC123`
4. Verify: Name prompt IS shown (unchanged behavior)
5. Enter "Link User" and click Join
6. Verify: User appears in participant list

**Expected:** Direct link behavior unchanged, name prompt shown.

### Step 5: Test validation

**Create form validation:**
1. Click "Create New Session" with empty name
2. Verify: Alert "Please enter your name" shown

**Join form validation:**
1. Click "Join Existing Session" with empty Session ID
2. Verify: Alert "Please enter a session ID" shown

### Step 6: Test keyboard interaction

**Create form:**
1. Type name in Create form
2. Press Enter key
3. Verify: Session created (same as clicking button)

**Join form:**
1. Type Session ID in Join form
2. Press Enter key
3. Verify: Navigate to session (same as clicking button)

### Step 7: Test form isolation

**Actions:**
1. Type "Alice" in Create form name field
2. Type "XYZ789" in Join form Session ID field
3. Verify: Inputs don't interfere with each other
4. Clear Create name field
5. Verify: Join Session ID field unchanged

**Expected:** Forms are completely independent.

### Step 8: Document test results

If all tests pass, create a checklist in the plan:
- ✅ Create flow: No double name entry
- ✅ Join with code: Name prompt on Session Page
- ✅ Join with link: Name prompt on Session Page (unchanged)
- ✅ Validation working for both forms
- ✅ Keyboard interaction working
- ✅ Form isolation verified

### Step 9: Stop dev server

Press Ctrl+C to stop the dev server.

---

## Task 6: Update Tests to Match New Behavior

**Files:**
- Modify: `frontend/src/components/LandingPage.test.tsx`

### Step 1: Read current test file

Read: `frontend/src/components/LandingPage.test.tsx`

### Step 2: Update tests for new structure

**Key changes needed:**
- Tests should use separate state variables (createName, joinSessionId)
- Create test should only interact with Create form
- Join test should only interact with Join form
- No shared state between forms

### Step 3: Run tests

Run: `npm run test:ci --workspace=frontend`

Expected: All tests pass.

### Step 4: Commit

```bash
git add frontend/src/components/LandingPage.test.tsx
git commit -m "test: update tests for separated form structure"
```

---

## Task 7: Final Verification

**Files:**
- None (verification step)

### Step 1: Run full test suite

Run: `npm run test:ci --workspace=frontend && npm run test:ci --workspace=backend`

Expected: All 81 tests pass.

### Step 2: Run linter

Run: `npm run lint`

Expected: No linting errors.

### Step 3: Build for production

Run: `npm run build`

Expected: Frontend and backend build successfully.

### Step 4: Document completion

All tests passing, build successful, manual testing verified.

Ready for code review and merge.

---

## Success Criteria Checklist

- [ ] Users creating sessions never see name prompt on Session Page
- [ ] Users joining with code see name prompt on Session Page
- [ ] Clear visual separation between Create and Join forms
- [ ] No validation confusion (each form validates only its own fields)
- [ ] All existing tests still pass
- [ ] Build succeeds with no errors
- [ ] Manual testing scenarios verified

---

## Rollback Plan

If issues are discovered:

```bash
# Return to main branch
cd /Users/tmogdans/Code/mf-estimates
git worktree remove .worktrees/feature/landing-page-ux
git branch -D feature/landing-page-ux
```

Original behavior remains intact on main branch.

---

## Notes for Implementation

**Key Points:**
- The name input is removed from the Join form entirely
- Navigation to SessionPage happens without name for Join flow
- SessionPage already has logic to show name prompt when not joined
- Create flow auto-joins because name is in navigation state

**Edge Cases:**
- Browser back button: User returns to Landing Page, forms are reset (React state clears)
- Refresh on SessionPage: Navigation state is lost, but session context preserves join status
- Multiple tabs: Each tab has independent state, works as expected

**Testing Focus:**
- Form independence (typing in one doesn't affect the other)
- Validation only on relevant fields per form
- Navigation state passing correctly from Create flow
- Auto-join logic triggered only when name is present

---

**Implementation Time Estimate:** 4-6 tasks, approximately 30-40 minutes total
