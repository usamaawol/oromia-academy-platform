# Oromia Academy Platform

Build a complete, production-quality **Progressive Web App (PWA)** called **Oromia Academy**.

The application is a **technology education and digital examination platform** for an academy that teaches practical technology skills, especially **Artificial Intelligence, AI editing, Telegram earning, Telegram bots, bot automation, and connecting bots with AI**.

The platform must be designed specifically around the identity and teaching style of Oromia Academy described below.

---

# 1. ACADEMY IDENTITY

### Academy Name

**Oromia Academy**

### Main Language

**Afaan Oromoo**

### Secondary Language

**English**

Afaan Oromoo must be the default language throughout the application.

Users must be able to switch between:

**Afaan Oromoo ↔ English**

The language selector should be easily accessible from the navbar/settings.

Do not make English the default.

The entire UI should be prepared for proper Afaan Oromoo localization, including:

* Navigation
* Buttons
* Forms
* Error messages
* Exam instructions
* Student dashboard
* Admin dashboard
* Notifications
* Results
* Settings
* Course information
* Help text
* Authentication screens

Do not mix Afaan Oromoo and English unnecessarily.

When Afaan Oromoo is selected, the interface should feel naturally written for Afaan Oromoo users.

---

# 2. ACADEMY PURPOSE

Oromia Academy is a practical technology education academy.

The academy helps people move their technology skills to a higher level through practical training.

The academy's core teaching areas currently include:

### AI Editing

Teaching students how to:

* Create images using AI
* Create videos using AI
* Edit images using AI
* Edit videos using AI
* Use AI tools correctly
* Use AI creatively and practically

### Telegram Earning

Teaching students:

* How to create Telegram channels
* How to manage Telegram channels
* Telegram content strategies
* Telegram growth strategies
* Practical methods for generating income through Telegram

### Bot Automation

Teaching students:

* How to create Telegram bots
* How Telegram bots work
* Bot automation
* Connecting bots with AI
* Making bots perform useful automated tasks
* Building practical AI-powered bots

The architecture must allow the academy owner to add additional technology courses in the future.

Do NOT hard-code the academy around Biology, Physics, Chemistry, or traditional school subjects.

This is a **technology-focused academy**.

---

# 3. ACADEMY MESSAGE

Use the following concept as the foundation of the academy's landing page:

"While everyone is moving toward the future with AI and technology, where are you?"

The academy should communicate:

* Learn modern technology
* Develop practical skills
* Learn AI
* Learn automation
* Build bots
* Use technology to create opportunities
* Move your skills to a higher level

The visual identity should feel:

**Modern + Technology + AI + Practical Learning + Opportunity + Trust**

---

# 4. LANDING PAGE

Create a modern, attractive landing page for Oromia Academy.

The homepage should clearly communicate:

### Hero Section

Academy name:

**Oromia Academy**

Main message in Afaan Oromoo.

Example concept:

"Teeknooloojii fi AI baradhu; dandeettii kee gara sadarkaa ol'aanaatti ceesisu."

Supporting text explaining that Oromia Academy teaches practical technology skills.

Primary CTA:

**Amma Galmaa'i**

Secondary CTA:

**Barnoota Ilaali**

Do not overuse English.

---

# 5. CURRENT TRAINING PROGRAMS

Create a course/training section.

Show the current programs:

### 1. AI Editing

Description should explain that students learn practical AI-based image and video creation/editing.

### 2. Telegram Earning

Description should explain channel creation, management, growth, and practical earning strategies.

### 3. Bot Automation

Description should explain Telegram bot creation, automation, AI integration, and practical bot development.

Each course should have:

* Title
* Description
* Icon/image
* Level
* Status
* Instructor if applicable
* Number of lessons if applicable
* Exam availability if applicable

The owner must be able to add new courses later.

---

# 6. REGISTRATION CTA

The academy currently uses the following contact information for registration:

**Admin Telegram: @SuufiyaanBJICS**

Provide a clear registration/contact section.

Main CTA:

**Galmaa'uuf Admin Qunnami**

The Telegram username should be displayed clearly.

If an external Telegram link is used, make it configurable from the admin settings rather than hard-coding it throughout the application.

---

# 7. AUTHENTICATION

Implement Firebase Authentication.

Students should be able to:

* Register
* Login
* Logout
* Reset password
* Manage profile

Registration fields can include:

* Full name
* Email
* Password
* Selected course/program
* Optional phone number if the academy decides to collect it

Use proper Firebase Authentication.

Never expose passwords.

---

# 8. USER ROLES

Implement role-based access control.

## Owner / Super Admin

The owner has full control.

The owner can:

* Manage students
* Manage courses
* Create exams
* Edit exams
* Delete exams
* Publish exams
* Unpublish exams
* Close exams
* Create questions
* Import questions from PDF
* Use AI to extract questions
* Generate questions with AI
* Review AI questions
* Configure exam rules
* Set passwords
* Set attempts
* Set duration
* Configure randomization
* Grade exams
* Regrade exams
* Publish results
* Hide results
* View analytics
* Export results
* Manage instructors
* Manage notifications
* Manage website content
* Manage translations
* Manage registration information
* Manage academy settings
* View audit logs

The owner should have complete control.

---

# 9. INSTRUCTOR ROLE

Create an instructor role that the owner can assign.

Depending on permissions, instructors can:

* Create exams
* Add questions
* Import questions
* Review AI-generated questions
* Grade short answers
* Grade essay answers
* View student performance
* View course-related exams

The owner controls instructor permissions.

---

# 10. STUDENT ROLE

Students can:

* Register
* Login
* Select/view their course
* View available exams
* Enter exam password
* Take exams
* Save answers
* Submit exams
* View published results
* View exam history
* Receive notifications
* Change language

Students must not access administrative functionality.

---

# 11. STUDENT DASHBOARD

Create a clean student dashboard.

Display:

### Afaan Oromoo

* Barnoota Koo
* Qormaata Jiru
* Qormaata Dhufu
* Qormaata Xumurame
* Bu'aa Qormaataa
* Beeksisa

English equivalent:

* My Courses
* Available Exams
* Upcoming Exams
* Completed Exams
* Results
* Notifications

The language should dynamically change all UI labels.

---

# 12. COURSE DASHBOARD

Students should be able to see their enrolled/current technology training.

For example:

### AI Editing

Progress:

65%

### Telegram Earning

Progress:

40%

### Bot Automation

Progress:

80%

Design the system so course lessons can be added later.

---

# 13. DIGITAL EXAMINATION SYSTEM

The examination system is one of the most important features of the platform.

The owner must be able to create professional digital exams for each technology course.

Example:

**AI Editing — Qormaata**

or:

**Bot Automation Final Assessment**

---

# 14. EXAM CREATION

When the owner clicks:

**Create Exam**

allow them to configure:

### Basic Information

* Exam title
* Course
* Topic
* Description
* Instructions
* Language
* Instructor

### Scheduling

* Start date
* Start time
* End date
* End time

### Duration

Example:

60 minutes

### Attempts

* 1
* 2
* 3
* Custom
* Unlimited for practice exams

### Exam Password

Every exam MUST have its own password.

Example:

BOT2026

Students must enter this password to access the exam.

---

# 15. EXAM ACCESS VERIFICATION

When a student tries to enter an exam:

1. Verify login.
2. Verify student account.
3. Verify course/enrollment eligibility.
4. Verify exam availability.
5. Verify attempt limit.
6. Ask for exam password.
7. Verify password securely.
8. Create an exam session.
9. Allow the student to start.

Do not allow students to bypass exam restrictions.

---

# 16. QUESTION TYPES

Support:

### Multiple Choice

Example technology question:

"What is the main purpose of a Telegram bot?"

A. Manual photo editing

B. Automating tasks on Telegram

C. Creating a computer operating system

D. Designing hardware

### True/False

### Short Answer

Example:

"Telegram bot tokko maalif fayyada?"

### Long Answer / Essay

Example:

"AI bot tokko Telegram waliin akkamitti walitti hidhuun danda'ama?"

The system should support additional question types in the future.

---

# 17. QUESTION BANK

Create a reusable question bank.

Questions can be categorized by:

* Course
* Topic
* Question type
* Difficulty
* Language
* Tags

Examples:

AI Editing
→ Image Generation
→ Beginner
→ MCQ

Bot Automation
→ Telegram Bots
→ Intermediate
→ Short Answer

Bot Automation
→ AI Integration
→ Advanced
→ Essay

---

# 18. QUESTION RANDOMIZATION

The owner must be able to choose:

### Normal

Everyone receives the same question order.

### Shuffle Questions

Each student receives a different order.

### Shuffle Options

MCQ options are randomized.

### Shuffle Both

Questions and options are randomized.

---

# 19. QUESTION POOLS

Allow the owner to create a pool.

Example:

Question bank:

50 questions

Exam:

20 questions per student

Student A may receive:

2, 7, 11, 18...

Student B may receive:

1, 5, 13, 21...

The system must securely store which questions each student actually received.

---

# 20. EXAM VERSIONS

Support randomized exam versions.

Student A:

Version A

Student B:

Version B

Student C:

Version C

Different versions can contain:

* Different question order
* Different option order
* Different questions from a pool

The system must still know exactly how each student's exam was generated and graded.

---

# 21. TIMER

Implement a reliable timer.

Example:

**60:00**

The timer should be based on trusted server timestamps.

Do not rely only on the student's local browser clock.

When time expires:

**Automatically submit the exam.**

If the student closes the browser and returns, the remaining time must still be correct.

---

# 22. AUTO-SAVE

Automatically save answers.

Use local browser storage/IndexedDB for temporary offline persistence.

Synchronize with Firebase when online.

If internet disconnects:

Show:

**Ati offline jirta. Deebiin kee meeshaa kana irratti olkaa'amaa jira.**

When connection returns:

**Interneetiin deebi'eera. Deebii kee wal-simsiisaa jirra...**

Never lose student answers because of a temporary connection problem.

---

# 23. PWA / OFFLINE-FIRST

The application must be a real PWA.

Students should be able to install it on Android and desktop.

Include:

* Service worker
* Manifest
* Offline caching
* Install prompt
* Network status detection
* Local answer persistence
* Synchronization

However, offline functionality must NEVER bypass:

* Authentication
* Exam password
* Exam schedule
* Attempt limits
* Exam duration
* Authorization

Establish the exam session securely before allowing controlled offline behavior.

---

# 24. EXAM NAVIGATION

Allow the owner to configure:

* Previous button
* Next button
* Question navigation
* Question progress
* Backward navigation
* One-question-at-a-time mode

Example:

**Gaaffii 8 / 30**

Progress bar:

████████░░░░░░

---

# 25. ANTI-CHEATING

Implement reasonable anti-cheating functionality.

### Random questions

Different students can receive different questions.

### Random options

MCQ choices can be randomized.

### Question pools

Different students can receive different questions.

### Time limit

Limit examination duration.

### Tab switching

Track when the student leaves the exam.

Example:

**Tab switched: 3 times**

Show this to the admin.

Do not automatically fail the student simply because they changed tabs unless the owner explicitly enables that policy.

### Fullscreen

Allow the owner to require fullscreen.

Record when the student exits fullscreen.

---

# 26. SUBMISSION

Before submitting, show:

* Answered questions
* Unanswered questions
* Time remaining

Example:

Answered: 25/30

Unanswered: 5

Then:

**Qormaata Ergi / Submit Exam**

Ask for confirmation before final submission.

After submission, lock the attempt.

---

# 27. AUTOMATIC GRADING

Automatically grade:

* Multiple choice
* True/False
* Other objectively gradable questions

Calculate:

* Correct
* Wrong
* Unanswered
* Total score
* Percentage
* Pass/fail
* Grade if configured

---

# 28. MANUAL GRADING

Short-answer and essay questions should support manual grading.

Admin/instructor can see:

Question

Student Answer

Expected Answer

Rubric

Points Available

Points Awarded

Feedback

The score should automatically update the final result.

---

# 29. AI-ASSISTED GRADING

Add optional AI assistance for short-answer and essay questions.

AI can suggest:

* Score
* Key concepts identified
* Missing concepts
* Explanation

Example:

AI Suggested Score:

8/10

Detected:

✓ Telegram bot definition

✓ Automation

✓ API integration

Missing:

✗ Authentication explanation

The instructor must be able to accept or change the AI suggestion.

AI is an assistant, not the final authority.

---

# 30. PDF → EXAM QUESTION IMPORT

Create an advanced feature:

**PDF irraa Gaaffilee Galchi**

The admin uploads a PDF containing technology questions.

The system should:

1. Upload PDF to Firebase Storage.
2. Extract text.
3. Use OCR if necessary.
4. Process the content using AI.
5. Identify individual questions.
6. Identify options.
7. Identify possible answers.
8. Identify question types.
9. Identify topics.
10. Identify difficulty.
11. Return structured questions.

Example:

Question:

"AI jechuun maal jechuudha?"

Type:

MCQ

Options:

A...

B...

C...

D...

Possible answer:

B

Topic:

AI Fundamentals

Difficulty:

Beginner

---

# 31. AI QUESTION REVIEW

Never automatically publish AI-generated/imported questions.

Display:

**Gaaffilee AI'n Argaman — Mirkaneessi**

For each question:

* Approve
* Edit
* Delete
* Regenerate
* Change type
* Change correct answer
* Change points
* Change topic
* Change difficulty

Only approved questions can be used in official exams.

---

# 32. AI QUESTION GENERATOR

Allow the owner to generate questions using AI.

Example:

Course:

Bot Automation

Topic:

Telegram Bot + AI Integration

Number:

20

Question types:

MCQ + Short Answer

Difficulty:

Mixed

Language:

Afaan Oromoo

AI should generate questions in the selected language.

The owner reviews the generated questions before publishing.

Also allow English question generation.

---

# 33. MULTILINGUAL QUESTIONS

Important:

The UI language and exam/question language should be independently configurable.

For example:

A student may use the UI in Afaan Oromoo while an exam is written in Afaan Oromoo.

Another exam could be in English.

The owner should be able to choose:

**Exam Language:**

* Afaan Oromoo
* English
* Both

If "Both" is selected, questions can display both languages where appropriate.

---

# 34. AI QUESTION QUALITY CHECKING

Allow AI to check questions for:

* Duplicate questions
* Ambiguous wording
* Missing answer
* Multiple possible correct answers
* Wrong answer
* Grammar problems
* Question/answer mismatch
* Difficulty problems

Display warnings before publication.

The admin makes the final decision.

---

# 35. EXAM BLUEPRINT

Create an advanced exam builder.

Example:

Course:

Bot Automation

Total:

30 questions

Topic distribution:

* Telegram Bot Basics → 10
* Bot Commands → 7
* Automation → 6
* AI Integration → 7

Difficulty:

* Easy → 30%
* Medium → 50%
* Hard → 20%

The system selects suitable questions from the question bank.

If there are not enough questions, tell the admin.

Do not silently create an invalid exam.

---

# 36. RESULTS

The owner must control result visibility.

Options:

### Immediate

Student sees result immediately.

### Manual Publication

Student sees nothing until admin publishes results.

### Scheduled Publication

Results become visible at a specific time.

---

# 37. INDIVIDUAL RESULT

When published, students can see:

Exam name

Score

Percentage

Correct answers

Wrong answers

Unanswered

Time used

Pass/fail

Teacher feedback

Depending on admin settings, optionally show:

* Correct answers
* Explanations
* Question-by-question review

---

# 38. GENERAL RESULTS

The owner can choose whether to publish:

### Private Result

Student sees only their own score.

### Anonymous Ranking

Students see ranking without unnecessary personal information.

### General Statistics

Students see:

* Average
* Highest score
* Lowest score
* Pass rate

### Full Results

Authorized users can see the full result list.

The owner controls this.

---

# 39. ANALYTICS

Admin dashboard should show:

* Total students
* Total courses
* Total exams
* Completed exams
* Active exams
* Average score
* Highest score
* Lowest score
* Pass rate
* Number of attempts

Question analytics:

Question 1:

82% correct

Question 12:

34% correct

This helps the academy identify which technology concepts students understand or struggle with.

---

# 40. STUDENT PERFORMANCE

Each student's profile should have performance history.

Show:

* Courses
* Exams completed
* Scores
* Average
* Pass rate
* Progress
* Performance over time

Example:

AI Editing → 84%

Telegram Earning → 76%

Bot Automation → 91%

---

# 41. REGRADING

If an admin discovers that a question had an incorrect answer:

Admin changes:

B → C

The system should:

* Recalculate affected exams
* Update scores
* Keep an audit record
* Optionally notify students

---

# 42. AUDIT LOG

Record important admin actions.

Examples:

"Admin changed Question 12 answer."

"Admin published Bot Automation results."

"Admin changed exam duration."

"Admin reset Student X's attempt."

Record:

* User
* Action
* Date/time
* Relevant object
* Previous value where appropriate
* New value where appropriate

---

# 43. NOTIFICATIONS

Support notifications for:

* New course
* New exam
* Exam starting soon
* Exam deadline
* Results published
* Result changed after regrading
* Important academy announcements

Use Firebase Cloud Messaging where appropriate.

---

# 44. ADMIN CONTENT MANAGEMENT

The owner should be able to edit academy content without changing source code.

Allow admin to manage:

* Hero text
* Course descriptions
* Announcements
* Registration information
* Contact information
* Academy messages
* Featured courses
* FAQ
* Social/contact links

This is especially important because the academy may change its training programs over time.

---

# 45. REGISTRATION CONTACT

The current registration contact is:

**@SuufiyaanBJICS**

Display this prominently in the registration/contact area.

Make it configurable from admin settings so it can be changed later.

---

# 46. LANGUAGE SYSTEM

Implement proper internationalization.

Use a centralized translation system.

Do NOT hard-code text throughout components.

Example conceptual structure:

```text
translations/
 ├── om/
 │   ├── common
 │   ├── auth
 │   ├── dashboard
 │   ├── exams
 │   ├── results
 │   └── admin
 │
 └── en/
     ├── common
     ├── auth
     ├── dashboard
     ├── exams
     ├── results
     └── admin
```

Default:

**om**

Secondary:

**en**

Remember the user's selected language.

---

# 47. AFAAN OROMOO UI

Pay special attention to natural Afaan Oromoo wording.

Do not simply translate English word-by-word if the result sounds unnatural.

Use clear, simple Afaan Oromoo suitable for technology learners.

Examples of concepts:

Dashboard → **Daashboordii**

Course → **Koorsii / Barnoota**

Exam → **Qormaata**

Question → **Gaaffii**

Answer → **Deebii**

Result → **Bu'aa**

Submit → **Ergi**

Register → **Galmaa'i**

Login → **Seeni**

Settings → **Qindaa'ina**

Notifications → **Beeksisa**

Admin → **Bulchaa**

Student → **Barataa**

Use consistent terminology throughout the application.

Allow these translations to be modified later from the codebase/admin localization system.

---

# 48. ADMIN DASHBOARD LANGUAGE

The admin dashboard must also support:

**Afaan Oromoo / English**

The owner should be able to switch languages just like students.

---

# 49. MODERN TECHNOLOGY DESIGN

The design should visually communicate:

AI

Technology

Automation

Digital learning

Innovation

Use a clean modern interface.

Avoid:

* Traditional school-management appearance
* Overly childish designs
* Excessive decoration
* Unnecessary animations
* Cluttered dashboards

Use:

* Modern cards
* Clean typography
* Technology-themed icons
* Charts
* Progress indicators
* Status badges
* Responsive tables
* Search
* Filters
* Dark mode
* Light mode

---

# 50. MOBILE-FIRST DESIGN

Many students will access the platform using Android phones.

Therefore:

The student interface MUST be designed mobile-first.

The exam interface should have:

* Large touch targets
* Clear question display
* Large answer choices
* Visible timer
* Progress indicator
* Simple navigation
* Minimal distractions

Desktop should still have a complete responsive experience.

---

# 51. EXAM UI EXAMPLE

Conceptually:

```text
┌─────────────────────────────┐
│ Oromia Academy              │
│ Bot Automation               │
│                             │
│ Time: 42:18                 │
├─────────────────────────────┤
│ Gaaffii 8 / 30              │
│                             │
│ Telegram Bot jechuun maal?  │
│                             │
│ ○ Deebii A                  │
│ ○ Deebii B                  │
│ ○ Deebii C                  │
│ ○ Deebii D                  │
│                             │
│ [Dura]             [Itti Fufi]│
└─────────────────────────────┘
```

Keep the interface simple and focused.

---

# 52. SECURITY

This is an examination platform, so security is critical.

Implement:

* Firebase Authentication
* Firestore Security Rules
* Role-based access control
* Server-side validation
* Secure exam sessions
* Secure attempts
* Protected answer keys
* Protected admin routes
* Protected result modification
* Input validation
* Rate limiting where appropriate

Never expose correct answers to students before submission.

Do not rely on frontend security.

Do not place sensitive API keys in the frontend.

AI API calls should go through secure backend/server-side functions.

---

# 53. FIRESTORE ARCHITECTURE

Use a scalable structure such as:

```text
users
courses
topics
exams
questions
questionBanks
examAttempts
answers
results
notifications
auditLogs
examSessions
instructors
settings
translations
```

Design relationships carefully.

Do not duplicate large amounts of data unnecessarily.

---

# 54. EXAM ATTEMPT RECORD

Store enough information to reconstruct the exam attempt:

* Student ID
* Exam ID
* Attempt number
* Start time
* End time
* Questions presented
* Question order
* Option order
* Student answers
* Score
* Grading status
* Tab-switch events
* Fullscreen events
* Network events
* Final result

---

# 55. EXAM STATUS

Use clear exam lifecycle states:

**Draft**

**Scheduled**

**Active**

**Closed**

**Results Pending**

**Results Published**

**Archived**

The owner controls the lifecycle.

---

# 56. EXAM PREVIEW

Before publishing, admin can click:

**Preview Exam**

The admin should experience the exam interface as a student would.

Show:

* Questions
* Question order
* Option randomization
* Timer
* Navigation
* Instructions

Do not create a real student attempt.

---

# 57. EXAM VALIDATION

Before allowing publication, check:

* Exam title exists
* Course exists
* Questions exist
* Every objective question has an answer
* Enough questions exist for the question pool
* Duration is valid
* Password exists
* Dates are valid
* Required settings exist

Show clear errors.

---

# 58. EXPORT

Admin should be able to export results.

Support:

* CSV
* Excel-compatible data
* PDF reports where practical

Example:

Student | Course | Exam | Score | Percentage | Status | Date

---

# 59. FUTURE FEATURES

Architect the application so these can be added later:

* Full course lessons
* Video courses
* Assignments
* Coding challenges
* Online code editor
* Programming exams
* AI tutor
* AI chatbot for students
* Student discussion area
* Certificates
* QR certificate verification
* Leaderboards
* Badges
* Course completion tracking
* Payment/subscription
* Advanced proctoring
* More technology courses
* Instructor marketplace

Do not implement everything in V1.

Keep the architecture extensible.

---

# 60. MVP PRIORITY

Build in this order.

## Phase 1 — Academy Foundation

* Landing page
* Afaan Oromoo/English language system
* Firebase authentication
* Student profiles
* Admin roles
* Course management
* Admin dashboard
* Student dashboard

## Phase 2 — Digital Exams

* Exam creation
* Question types
* Question bank
* Exam password
* Access verification
* Timer
* Attempts
* Randomization
* Auto-save
* Submission
* Automatic grading

## Phase 3 — Results

* Manual grading
* Results
* Result publication
* Student performance
* Analytics
* Export
* Regrading

## Phase 4 — AI

* PDF upload
* OCR
* AI question extraction
* AI question generation
* AI question validation
* AI-assisted grading

## Phase 5 — Advanced

* Question pools
* Exam blueprint
* Notifications
* Audit logs
* Advanced anti-cheating
* Certificates
* Advanced analytics

---

# 61. IMPORTANT: DO NOT BUILD A FAKE PROTOTYPE

Do not create a static mockup with fake buttons.

Build real functionality.

The application must use:

* Real Firebase Authentication
* Real Firestore
* Real Storage
* Real exam data
* Real student accounts
* Real question banks
* Real exam attempts
* Real grading
* Real result publication
* Real PWA functionality

Use seed/demo data only when needed.

---

# 62. FINAL STUDENT WORKFLOW

The final student experience should be:

Landing Page

↓

Galmaa'i / Register

↓

Login

↓

Student Dashboard

↓

Choose/View Technology Course

↓

Available Exam

↓

Enter Exam Password

↓

Verification

↓

Start Exam

↓

Answer Questions

↓

Auto-save

↓

Submit

↓

Automatic/Manual Grading

↓

Wait for Publication if necessary

↓

View Result

This process should be simple and fast.

---

# 63. FINAL ADMIN WORKFLOW

The owner workflow should be:

Admin Login

↓

Dashboard

↓

Create Course

↓

Create Question Bank

OR

Upload PDF

↓

AI Extracts Questions

↓

Review Questions

↓

Approve Questions

↓

Create Exam

↓

Select Questions

↓

Configure Question Pool

↓

Configure Randomization

↓

Set Password

↓

Set Attempts

↓

Set Duration

↓

Preview

↓

Validate

↓

Publish

↓

Students Take Exam

↓

Automatic/Manual Grading

↓

Review Results

↓

Publish Results

↓

Analytics

---

# 64. CORE PRODUCT PRINCIPLE

Oromia Academy should feel like a **modern Afaan Oromoo technology academy**, not a generic school website.

The platform should make it easy for people to learn and be assessed on practical technology skills.

The first visible academy programs should be:

**AI Editing**

**Telegram Earning**

**Bot Automation**

The system should be ready for future technology programs.

The primary language is:

**Afaan Oromoo**

Secondary language:

**English**

The examination system must be:

**Secure + Fast + Mobile-first + PWA + Offline-aware + Firebase-powered + AI-assisted + Highly configurable**

The owner must have powerful control over the entire examination lifecycle.

Students should have an extremely simple experience.

---

# 65. COMPLETE TEST SCENARIO

Before considering the application complete, test this complete scenario:

1. Admin logs in.
2. Admin creates "AI Editing" course.
3. Admin creates "Bot Automation" course.
4. Admin creates a question bank.
5. Admin manually adds questions.
6. Admin uploads a PDF containing technology questions.
7. AI extracts the questions.
8. Admin reviews and edits them.
9. Admin approves the questions.
10. Admin creates a Bot Automation exam.
11. Admin selects 30 questions.
12. Admin enables question randomization.
13. Admin enables option randomization.
14. Admin sets a question pool if desired.
15. Admin sets exam password.
16. Admin sets duration.
17. Admin sets attempt limit.
18. Admin previews the exam.
19. Admin publishes it.
20. Student registers.
21. Student selects the relevant course.
22. Student sees the exam.
23. Student enters the exam password.
24. System verifies eligibility.
25. Student starts the exam.
26. Timer starts.
27. Answers automatically save.
28. Student temporarily loses internet.
29. Answers remain available.
30. Internet returns.
31. Answers synchronize.
32. Student submits.
33. MCQs are automatically graded.
34. Short answers go to instructor/admin for grading.
35. Admin reviews the result.
36. Admin publishes results.
37. Student receives notification.
38. Student views their result.
39. Admin views analytics.
40. Admin exports the results.
41. Admin discovers an incorrect answer.
42. Admin corrects the answer.
43. System recalculates affected results.
44. Audit log records the change.

Every part of this workflow must be functional.

Build the application with clean architecture, strong security, scalable Firebase data structures, excellent mobile UX, and a genuinely usable Afaan Oromoo-first experience.
use this firebase as a backend 
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "@secret:GOOGLE_API_KEY ",
  authDomain: "oromia-academy.firebaseapp.com",
  projectId: "oromia-academy",
  storageBucket: "oromia-academy.firebasestorage.app",
  messagingSenderId: "754534143898",
  appId: "1:754534143898:web:1ee8549a7cec2cd0990c23",
  measurementId: "G-EGTGLPQ83E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7952a665-afc0-49f5-b5c5-07222dbe59f5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
