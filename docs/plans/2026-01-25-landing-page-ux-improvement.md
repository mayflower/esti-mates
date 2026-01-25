# Landing Page UX Improvement - Design Document

**Date:** 2026-01-25
**Status:** Approved
**Related to:** MF EstiMates Landing Page

---

## Problem Statement

The current Landing Page has a UX issue where users joining an existing session must enter their name twice:

1. **First input:** On the Landing Page, the name field is required by form validation even when only entering a Session ID to join
2. **Second input:** On the Session Page, users must enter their name again

This is confusing because:
- The visual separation with "or" suggests the name input is only for "Create New Session"
- Users expect that entering Session ID + Name on the Landing Page should be sufficient
- The double entry creates friction in the join flow

---

## Solution Overview

Split the Landing Page into two separate, visually distinct forms to clarify the different workflows:

1. **Create New Session Form:** Name input + Create button
2. **Join Existing Session Form:** Session ID input only + Join button

This eliminates the double name entry and makes the flows crystal clear.

---

## User Flows

### Flow 1: Create New Session

1. User enters name in "Create New Session" form
2. Clicks "Create New Session" button
3. Session is created, user navigates to `/session/:id` with name passed via navigation state
4. Session Page auto-joins user as moderator (no name prompt)
5. User is in the session immediately

**Key:** Name is provided once and carried through the flow.

### Flow 2: Join with Session Code (from Landing Page)

1. User enters Session ID in "Join Existing Session" form (no name field)
2. Clicks "Join Existing Session" button
3. User navigates to `/session/:id` without name
4. Session Page shows name prompt
5. User enters name and joins

**Key:** Consistent with link-based join flow.

### Flow 3: Join with Direct Link

1. User clicks shared link, lands directly on `/session/:id`
2. Session Page shows name prompt (as before)
3. User enters name and joins

**Key:** No change from current behavior.

---

## Technical Implementation

### LandingPage.tsx Changes

**State Management:**
```tsx
const [createName, setCreateName] = useState("");     // For Create form
const [joinSessionId, setJoinSessionId] = useState(""); // For Join form
```

**Form Handlers:**
```tsx
// Create New Session
const handleCreate = () => {
  if (!createName.trim()) {
    alert("Please enter your name");
    return;
  }
  onCreateSession(createName.trim());
};

// Join Existing Session (no name validation!)
const handleJoin = () => {
  if (!joinSessionId.trim()) {
    alert("Please enter a session ID");
    return;
  }
  navigate(`/session/${joinSessionId.trim().toUpperCase()}`);
};
```

**Component Structure:**
```tsx
<Container>
  <Logo />
  <Title>MF EstiMates</Title>

  {/* Form 1: Create */}
  <Card>
    <SectionTitle>Create New Session</SectionTitle>
    <Input
      placeholder="Your name"
      value={createName}
      onChange={(e) => setCreateName(e.target.value)}
    />
    <Button onClick={handleCreate}>Create New Session</Button>
  </Card>

  <Divider>or</Divider>

  {/* Form 2: Join */}
  <Card>
    <SectionTitle>Join Existing Session</SectionTitle>
    <Input
      placeholder="Session ID (6 characters)"
      value={joinSessionId}
      onChange={(e) => setJoinSessionId(e.target.value)}
    />
    <Button onClick={handleJoin}>Join Existing Session</Button>
  </Card>

  <Footer />
</Container>
```

### App.tsx Changes

**Passing Name via Navigation State:**
```tsx
const handleCreateSession = (name: string) => {
  const newSessionId = generateSessionId();
  navigate(`/session/${newSessionId}`, {
    state: {
      name,
      isModerator: true
    }
  });
};
```

### SessionPage.tsx Changes

**Reading Name from Navigation State:**
```tsx
const location = useLocation();
const { name: nameFromState, isModerator: isModeratorFromState } =
  location.state || {};

useEffect(() => {
  // Auto-join if name was passed from Landing Page (Create flow)
  if (nameFromState && urlSessionId && !joined) {
    joinSession(urlSessionId, nameFromState, isModeratorFromState);
  }
}, [nameFromState, urlSessionId, joined]);
```

**Show Join Prompt Logic:**
```tsx
// Show join prompt only if:
// 1. User hasn't joined yet AND
// 2. No name was passed via navigation state
const showJoinPrompt = !joined && !nameFromState;
```

---

## UI/UX Details

### Visual Design

**Two Separate Cards:**
- Both cards: `max-width: 500px`, equal width
- Same padding and styling as current Card component
- Clear visual separation with "or" Divider between them

**Section Titles:**
```tsx
const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.md};
  font-size: 1.25rem;
  text-align: center;
`;
```

### Form Validation

**Create Form:**
- Validates name is not empty
- Shows alert if validation fails

**Join Form:**
- Validates Session ID is not empty
- No name validation (removed!)
- Session ID auto-uppercased on submit

### Session Entry Scenarios

| Scenario | Name Source | Flow |
|----------|-------------|------|
| Create New Session | Landing Page input | Auto-join with name, no prompt |
| Join with Code | Session Page prompt | User enters name on Session Page |
| Join with Link | Session Page prompt | User enters name on Session Page |

---

## Benefits

1. ✅ **No Double Entry:** Users never enter their name twice
2. ✅ **Clear Separation:** Visual distinction makes it obvious which form is for what
3. ✅ **Consistent Join Flow:** Both join methods (code + link) work the same way
4. ✅ **Better UX:** Reduced friction, clearer expectations
5. ✅ **Flexible:** Users can join via code or link, both end up on Session Page for name entry

---

## Testing Checklist

### Manual Testing Scenarios

- [ ] Create New Session: Enter name → Click Create → Auto-join as moderator (no second name prompt)
- [ ] Join with Code: Enter Session ID only → Navigate to Session Page → Name prompt appears
- [ ] Join with Code: Try empty Session ID → Alert shown
- [ ] Join with Link: Open direct link → Name prompt appears (unchanged behavior)
- [ ] Create: Try empty name → Alert shown
- [ ] Navigation State: Verify name is passed correctly from Landing → Session Page
- [ ] Form Isolation: Verify typing in one form doesn't affect the other
- [ ] Session ID Uppercasing: Verify lowercase session IDs are converted to uppercase

### Edge Cases

- [ ] Refresh on Session Page after Create → User stays joined (session context preserved)
- [ ] Back button after Create → Returns to Landing Page, forms are reset
- [ ] Multiple tabs: Create in tab 1, join same session in tab 2 → Works as expected

---

## Implementation Tasks

1. Update LandingPage.tsx:
   - Split into two separate forms
   - Add separate state variables for each form
   - Update validation logic
   - Add SectionTitle styled component

2. Update App.tsx:
   - Pass name via navigation state in handleCreateSession

3. Update SessionPage.tsx:
   - Read name from navigation state
   - Auto-join logic when name is present
   - Update showJoinPrompt logic

4. Manual testing of all scenarios

---

## Files to Modify

- `/frontend/src/components/LandingPage.tsx` - Main implementation
- `/frontend/src/App.tsx` - Navigation state handling
- `/frontend/src/pages/SessionPage.tsx` - Auto-join logic

---

## Success Criteria

- ✅ Users creating sessions never see a name prompt on Session Page
- ✅ Users joining with code see name prompt on Session Page (consistent with link join)
- ✅ Clear visual separation between Create and Join forms
- ✅ No validation confusion about which field is for which action
- ✅ All existing functionality preserved

---

**Status:** Ready for implementation
