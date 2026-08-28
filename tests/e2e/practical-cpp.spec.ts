import {
  CPP_FOUNDATION_CONCEPT_IDS,
  CPP_FOUNDATION_MISSION_IDS,
  expect,
  test,
  type Page,
} from './fixtures'

const practicalCppCoursePath = '/courses/cpp-collections-records'
const practicalCppLessonPath = '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call'
const practicalCppMiddleLessonPath = '/learn/cpp-collections-records/cpp-records-structs/cpprecords3-build-part-record'
const practicalCppFinalLessonPath = '/learn/cpp-collections-records/cpp-records-workshop-report/cpprecords6-workshop-stock-report'
const progressStorageKey = 'see-pound-coffee-pie-progress-v3'
const practicalCppPrerequisites = {
  activeLanguage: 'cpp' as const,
  completedMissions: [...CPP_FOUNDATION_MISSION_IDS],
  completedProjects: ['first-compiled-program'],
}
const completedPracticalCppModulesBeforeFinal = [
  'cpp-records-return-values',
  'cpp-records-vectors',
  'cpp-records-structs',
  'cpp-records-updates',
  'cpp-records-summaries',
] as const

const practicalCppModuleIds = [
  'cpp-records-return-values',
  'cpp-records-vectors',
  'cpp-records-structs',
  'cpp-records-updates',
  'cpp-records-summaries',
  'cpp-records-workshop-report',
] as const

type PracticalCppExerciseType = 'bugfix' | 'choice' | 'code' | 'ordering' | 'prediction'

interface PracticalCppLessonCase {
  moduleIndex: number
  path: string
  runnerBacked: boolean
  title: string
  type: PracticalCppExerciseType
}

const practicalCppLessonCases = [
  {
    moduleIndex: 0,
    path: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
    runnerBacked: false,
    title: 'Trace a familiar function call',
    type: 'prediction',
  },
  {
    moduleIndex: 0,
    path: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-return-purpose',
    runnerBacked: false,
    title: 'Meet a returned answer',
    type: 'choice',
  },
  {
    moduleIndex: 0,
    path: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-predict-result',
    runnerBacked: false,
    title: 'Use a returned result',
    type: 'prediction',
  },
  {
    moduleIndex: 0,
    path: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-fix-return',
    runnerBacked: true,
    title: 'Repair the returned subtotal',
    type: 'bugfix',
  },
  {
    moduleIndex: 0,
    path: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-part-total',
    runnerBacked: true,
    title: 'Build a reusable part total',
    type: 'code',
  },
  {
    moduleIndex: 1,
    path: '/learn/cpp-collections-records/cpp-records-vectors/cpprecords2-retrieve-array',
    runnerBacked: false,
    title: 'Recall a fixed parts array',
    type: 'prediction',
  },
  {
    moduleIndex: 1,
    path: '/learn/cpp-collections-records/cpp-records-vectors/cpprecords2-vector-purpose',
    runnerBacked: false,
    title: 'Meet a growable collection',
    type: 'choice',
  },
  {
    moduleIndex: 1,
    path: '/learn/cpp-collections-records/cpp-records-vectors/cpprecords2-predict-growth',
    runnerBacked: false,
    title: 'Follow a vector as it grows',
    type: 'prediction',
  },
  {
    moduleIndex: 1,
    path: '/learn/cpp-collections-records/cpp-records-vectors/cpprecords2-fix-push-back',
    runnerBacked: true,
    title: 'Repair the vector update',
    type: 'bugfix',
  },
  {
    moduleIndex: 1,
    path: '/learn/cpp-collections-records/cpp-records-vectors/cpprecords2-add-parts',
    runnerBacked: true,
    title: 'Add parts to a vector',
    type: 'code',
  },
  {
    moduleIndex: 2,
    path: '/learn/cpp-collections-records/cpp-records-structs/cpprecords3-retrieve-types',
    runnerBacked: false,
    title: 'Recall typed storage',
    type: 'prediction',
  },
  {
    moduleIndex: 2,
    path: '/learn/cpp-collections-records/cpp-records-structs/cpprecords3-struct-purpose',
    runnerBacked: false,
    title: 'Meet a record shape',
    type: 'choice',
  },
  {
    moduleIndex: 2,
    path: '/learn/cpp-collections-records/cpp-records-structs/cpprecords3-predict-fields',
    runnerBacked: false,
    title: 'Read a part record',
    type: 'prediction',
  },
  {
    moduleIndex: 2,
    path: '/learn/cpp-collections-records/cpp-records-structs/cpprecords3-fix-field-access',
    runnerBacked: true,
    title: 'Repair the field name',
    type: 'bugfix',
  },
  {
    moduleIndex: 2,
    path: '/learn/cpp-collections-records/cpp-records-structs/cpprecords3-build-part-record',
    runnerBacked: true,
    title: 'Build and store a part record',
    type: 'code',
  },
  {
    moduleIndex: 3,
    path: '/learn/cpp-collections-records/cpp-records-updates/cpprecords4-retrieve-vector-loop',
    runnerBacked: false,
    title: 'Recall a vector loop',
    type: 'prediction',
  },
  {
    moduleIndex: 3,
    path: '/learn/cpp-collections-records/cpp-records-updates/cpprecords4-reference-purpose',
    runnerBacked: false,
    title: 'Meet a reference',
    type: 'choice',
  },
  {
    moduleIndex: 3,
    path: '/learn/cpp-collections-records/cpp-records-updates/cpprecords4-predict-update',
    runnerBacked: false,
    title: 'Follow an original record update',
    type: 'prediction',
  },
  {
    moduleIndex: 3,
    path: '/learn/cpp-collections-records/cpp-records-updates/cpprecords4-fix-copy-update',
    runnerBacked: true,
    title: 'Repair the copy mistake',
    type: 'bugfix',
  },
  {
    moduleIndex: 3,
    path: '/learn/cpp-collections-records/cpp-records-updates/cpprecords4-restock-part',
    runnerBacked: true,
    title: 'Restock a named part',
    type: 'code',
  },
  {
    moduleIndex: 4,
    path: '/learn/cpp-collections-records/cpp-records-summaries/cpprecords5-retrieve-return',
    runnerBacked: false,
    title: 'Recall a returned calculation',
    type: 'prediction',
  },
  {
    moduleIndex: 4,
    path: '/learn/cpp-collections-records/cpp-records-summaries/cpprecords5-accumulator-purpose',
    runnerBacked: false,
    title: 'Meet a running total',
    type: 'choice',
  },
  {
    moduleIndex: 4,
    path: '/learn/cpp-collections-records/cpp-records-summaries/cpprecords5-order-total',
    runnerBacked: false,
    title: 'Put the total in order',
    type: 'ordering',
  },
  {
    moduleIndex: 4,
    path: '/learn/cpp-collections-records/cpp-records-summaries/cpprecords5-fix-total-reset',
    runnerBacked: true,
    title: 'Keep the total between passes',
    type: 'bugfix',
  },
  {
    moduleIndex: 4,
    path: '/learn/cpp-collections-records/cpp-records-summaries/cpprecords5-low-stock',
    runnerBacked: true,
    title: 'Collect low-stock names',
    type: 'code',
  },
  {
    moduleIndex: 5,
    path: '/learn/cpp-collections-records/cpp-records-workshop-report/cpprecords6-trace-stock-update',
    runnerBacked: false,
    title: 'Trace a stock update',
    type: 'prediction',
  },
  {
    moduleIndex: 5,
    path: '/learn/cpp-collections-records/cpp-records-workshop-report/cpprecords6-plan-report',
    runnerBacked: false,
    title: 'Assign each report job',
    type: 'choice',
  },
  {
    moduleIndex: 5,
    path: '/learn/cpp-collections-records/cpp-records-workshop-report/cpprecords6-order-report',
    runnerBacked: false,
    title: 'Put the report flow in order',
    type: 'ordering',
  },
  {
    moduleIndex: 5,
    path: '/learn/cpp-collections-records/cpp-records-workshop-report/cpprecords6-fix-low-stock-check',
    runnerBacked: true,
    title: 'Repair the low-stock boundary',
    type: 'bugfix',
  },
  {
    moduleIndex: 5,
    path: '/learn/cpp-collections-records/cpp-records-workshop-report/cpprecords6-workshop-stock-report',
    runnerBacked: true,
    title: 'Build the Workshop Stock Report',
    type: 'code',
  },
] as const satisfies readonly PracticalCppLessonCase[]

const practicalCppCodeReferenceEntries = [
  {
    example: 'int total = subtotal(4, 3);',
    module: 'Functions that return answers',
    term: 'Return value',
  },
  {
    example: 'std::vector<std::string> parts = {"bolts", "seals"};',
    module: 'Vectors that grow and change',
    term: 'Vector',
  },
  {
    example: 'std::vector<std::string> parts;  // std::string is the element type',
    module: 'Vectors that grow and change',
    term: 'Element type',
  },
  {
    example: 'parts.push_back("bolts");',
    module: 'Vectors that grow and change',
    term: 'Member function',
  },
  {
    example: 'std::cout << parts.size();',
    module: 'Vectors that grow and change',
    term: 'Length',
  },
  {
    example: 'Part part{"bolts", 4};',
    module: 'Structs that group a record',
    term: 'Record',
  },
  {
    example: 'struct Part { std::string name; int quantity; };',
    module: 'Structs that group a record',
    term: 'Struct',
  },
  {
    example: 'std::cout << part.name << ": " << part.quantity;',
    module: 'Structs that group a record',
    term: 'Field',
  },
  {
    example: 'for (Part& part : parts) { part.quantity = part.quantity + 1; }',
    module: 'References that update records',
    term: 'Reference',
  },
  {
    example: 'int total = 0;\nfor (Part part : parts) { total = total + part.quantity; }',
    module: 'Totals and low-stock filters',
    term: 'Accumulator',
  },
  {
    example: 'if (part.quantity < limit) { names.push_back(part.name); }',
    module: 'Totals and low-stock filters',
    term: 'Filter',
  },
] as const

async function codeReferenceEntry(page: Page, term: string) {
  const search = page.getByRole('searchbox', { name: 'Search the code reference' })
  await search.fill(term)
  const entry = page.locator('details.glossary-entry').filter({
    has: page.getByRole('heading', { exact: true, name: term }),
  })
  await expect(entry).toHaveCount(1)
  await entry.locator('summary').click()
  return entry
}

function watchPracticalCppTeachingDataRequests(page: Page): string[] {
  const requests: string[] = []
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname
    if (/\/cpp-collections-records-course-packed\.generated-[^/]+\.json$/u.test(pathname)) {
      requests.push(pathname)
    }
  })
  return requests
}

function watchDocumentRequests(page: Page): string[] {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.resourceType() === 'document') {
      requests.push(new URL(request.url()).pathname)
    }
  })
  return requests
}

async function expectCanonicalLesson(
  page: Page,
  path: string,
  title: string,
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`${path}$`, 'u'))
  await expect(page).toHaveTitle(`${title} | SeePoundCoffeePie`)
  const heading = page.getByRole('heading', { exact: true, level: 1, name: title })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
}

async function openPracticalCppModule(page: Page, moduleNumber: number, title: string): Promise<void> {
  const moduleLabel = moduleNumber === 6 ? 'Final project' : `Module ${moduleNumber}`
  const summary = page.getByRole('button', {
    name: new RegExp(`${moduleLabel} ${title}`, 'u'),
  })
  if (await summary.getAttribute('aria-expanded') !== 'true') await summary.click()
}

async function savedActiveLanguage(page: Page): Promise<string | undefined> {
  return page.evaluate((storageKey) => {
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return undefined
    const parsed = JSON.parse(stored) as { activeLanguage?: string }
    return parsed.activeLanguage
  }, progressStorageKey)
}

test('the published Practical C++ route matrix stays exactly 12 runner-backed and 18 teaching-only lessons', () => {
  const paths = practicalCppLessonCases.map(({ path }) => path)
  const runnerBackedLessons = practicalCppLessonCases.filter(({ runnerBacked }) => runnerBacked)
  const teachingOnlyLessons = practicalCppLessonCases.filter(({ runnerBacked }) => !runnerBacked)

  expect(practicalCppLessonCases).toHaveLength(30)
  expect(new Set(paths).size).toBe(30)
  expect(runnerBackedLessons).toHaveLength(12)
  expect(teachingOnlyLessons).toHaveLength(18)
  expect(runnerBackedLessons.every(({ type }) => type === 'bugfix' || type === 'code')).toBe(true)
  expect(teachingOnlyLessons.every(({ type }) => type !== 'bugfix' && type !== 'code')).toBe(true)
})

test.describe('all published Practical C++ deep links', () => {
  for (const lesson of practicalCppLessonCases) {
    const classification = lesson.runnerBacked ? 'runner-backed' : 'teaching-only'

    test(`${lesson.title} opens as a ${classification} route`, async ({ page, seedProgress }) => {
      const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
      await seedProgress({
        ...practicalCppPrerequisites,
        completedMissions: [
          ...practicalCppPrerequisites.completedMissions,
          ...practicalCppModuleIds.slice(0, lesson.moduleIndex),
        ],
      })
      await page.goto(lesson.path)

      await expectCanonicalLesson(page, lesson.path, lesson.title)
      await expect(page.getByText('Lesson locked')).toHaveCount(0)
      expect(teachingDataRequests).toHaveLength(1)

      const editor = page.getByRole('textbox', { name: 'Code editor' })
      const fileLabel = page.locator('.editor-bar').getByText('main.cpp', { exact: true })
      const safetyNote = page.getByText('How code runs safely', { exact: true })
      const runResults = page.getByRole('region', { name: 'Run results' })

      if (lesson.runnerBacked) {
        await expect(editor).toBeVisible()
        await expect(fileLabel).toBeVisible()
        await expect(page.getByRole('button', { exact: true, name: 'Check my code' })).toBeVisible()
        await expect(safetyNote).toBeVisible()
        await expect(runResults).toHaveCount(0)
      } else {
        const action = lesson.type === 'ordering' ? 'Check order' : 'Check answer'
        await expect(page.getByRole('button', { exact: true, name: action })).toBeVisible()
        await expect(editor).toHaveCount(0)
        await expect(fileLabel).toHaveCount(0)
        await expect(safetyNote).toHaveCount(0)
        await expect(runResults).toHaveCount(0)
      }
    })
  }
})

test('the production catalog exposes the reviewed sixth course', async ({ page, seedProgress }) => {
  const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
  await seedProgress({ activeLanguage: 'cpp' })
  await page.goto('/courses')

  const catalog = page.getByRole('region', { name: 'Courses' })
  await expect(page.getByRole('heading', { level: 1, name: 'Choose a course' })).toBeVisible()
  await expect(catalog.getByRole('article')).toHaveCount(6)
  await expect(catalog.getByRole('heading', { name: 'Practical C++: Collections and Records' })).toBeVisible()
  await expect(catalog.locator(`a[href="${practicalCppCoursePath}"]`)).toHaveCount(1)
  expect(teachingDataRequests).toEqual([])
})

test('the Practical C++ course and direct lesson explain both missing prerequisites', async ({ page, seedProgress }) => {
  const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
  await seedProgress({ activeLanguage: 'cpp' })
  await page.goto(practicalCppCoursePath)

  await expect(page.getByRole('heading', { level: 1, name: 'Practical C++: Collections and Records' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Complete these first' })).toBeVisible()
  await expect(page.getByText('Complete C++ Foundations', { exact: true })).toBeVisible()
  await expect(page.getByText('Complete Your First Compiled Program', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Modules' }).getByRole('button')).toHaveCount(6)
  await expect(page.getByRole('link', { name: /^Start course/iu })).toHaveCount(0)
  expect(teachingDataRequests).toHaveLength(1)

  await page.goto(practicalCppLessonPath)
  const lockedHeading = page.getByRole('heading', { level: 1, name: 'Trace a familiar function call is still ahead' })
  await expect(lockedHeading).toBeVisible()
  await expect(lockedHeading).toBeFocused()
  await expect(page).toHaveTitle('Trace a familiar function call | SeePoundCoffeePie')
  await expect(page.getByRole('link', { exact: true, name: 'Complete C++ Foundations' })).toBeVisible()
  await expect(page.getByRole('link', { exact: true, name: 'Complete Your First Compiled Program' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return to Practical C++' })).toHaveAttribute(
    'href',
    practicalCppCoursePath,
  )
  expect(teachingDataRequests).toHaveLength(2)
  expect(teachingDataRequests[1]).toBe(teachingDataRequests[0])
})

test('the Practical C++ course opens its first lesson inside the same SPA', async ({ page, seedProgress }) => {
  const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
  const documentRequests = watchDocumentRequests(page)
  await seedProgress(practicalCppPrerequisites)
  await page.goto(practicalCppCoursePath)

  const startCourse = page.getByRole('link', { name: /^Start course/iu })
  await expect(startCourse).toHaveAttribute('href', practicalCppLessonPath)
  await expect(page.getByRole('region', { name: 'Modules' }).getByRole('button')).toHaveCount(6)
  expect(teachingDataRequests).toHaveLength(1)
  expect(documentRequests).toEqual([practicalCppCoursePath])

  await startCourse.click()
  await expectCanonicalLesson(page, practicalCppLessonPath, 'Trace a familiar function call')
  await expect(page.getByText('Lesson locked')).toHaveCount(0)
  expect(teachingDataRequests).toHaveLength(1)
  expect(documentRequests).toEqual([practicalCppCoursePath])
})

test('first, middle, and final published lessons share one cached teaching-data request through history', async ({ page, seedProgress }) => {
  const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
  const documentRequests = watchDocumentRequests(page)
  await seedProgress({
    ...practicalCppPrerequisites,
    completedMissions: [
      ...practicalCppPrerequisites.completedMissions,
      ...completedPracticalCppModulesBeforeFinal,
    ],
  })
  await page.goto(practicalCppCoursePath)

  await openPracticalCppModule(page, 1, 'Functions that return answers')
  await page.locator(`a[href="${practicalCppLessonPath}"]`).click()
  await expectCanonicalLesson(page, practicalCppLessonPath, 'Trace a familiar function call')

  await page.getByRole('button', { name: 'Exit lesson' }).click()
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  await openPracticalCppModule(page, 3, 'Structs that group a record')
  await page.locator(`a[href="${practicalCppMiddleLessonPath}"]`).click()
  await expectCanonicalLesson(page, practicalCppMiddleLessonPath, 'Build and store a part record')

  await page.getByRole('button', { name: 'Exit lesson' }).click()
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  await openPracticalCppModule(page, 6, 'Build a Workshop Stock Report')
  await page.locator(`a[href="${practicalCppFinalLessonPath}"]`).click()
  await expectCanonicalLesson(page, practicalCppFinalLessonPath, 'Build the Workshop Stock Report')

  expect(teachingDataRequests).toHaveLength(1)
  expect(documentRequests).toEqual([practicalCppCoursePath])

  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  await expect(page.getByRole('heading', { exact: true, level: 1, name: 'Practical C++: Collections and Records' })).toBeFocused()
  await page.goBack()
  await expectCanonicalLesson(page, practicalCppMiddleLessonPath, 'Build and store a part record')
  await page.goForward()
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  await expect(page.getByRole('heading', { exact: true, level: 1, name: 'Practical C++: Collections and Records' })).toBeFocused()
  await page.goForward()
  await expectCanonicalLesson(page, practicalCppFinalLessonPath, 'Build the Workshop Stock Report')

  expect(teachingDataRequests).toHaveLength(1)
  expect(documentRequests).toEqual([practicalCppCoursePath])
})

test('direct published course and lesson history does not replace the saved language preference', async ({ page, seedProgress }) => {
  await seedProgress({ activeLanguage: 'python' })
  await page.goto(practicalCppCoursePath)

  await expect(page.getByRole('heading', { level: 1, name: 'Practical C++: Collections and Records' })).toBeVisible()
  expect(await savedActiveLanguage(page)).toBe('python')

  await page.goto(practicalCppLessonPath)
  await expect(page.getByRole('heading', { level: 1, name: 'Trace a familiar function call is still ahead' })).toBeVisible()
  expect(await savedActiveLanguage(page)).toBe('python')

  await page.goBack()
  await expect(page.getByRole('heading', { level: 1, name: 'Practical C++: Collections and Records' })).toBeVisible()
  expect(await savedActiveLanguage(page)).toBe('python')

  await page.goForward()
  await expect(page.getByRole('heading', { level: 1, name: 'Trace a familiar function call is still ahead' })).toBeVisible()
  expect(await savedActiveLanguage(page)).toBe('python')
})

test('Home and Profile own Practical C++ through compact records without downloading its teaching data', async ({ page, seedProgress }) => {
  const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
  await seedProgress(practicalCppPrerequisites)
  await page.goto('/home')

  const continuation = page.locator('section.continue-panel')
  await expect(continuation.getByText('Your next course', { exact: true })).toBeVisible()
  await expect(continuation.getByRole('heading', { exact: true, name: 'Practical C++: Collections and Records' })).toBeVisible()
  await expect(continuation.getByRole('link', { name: /^Start course/iu })).toHaveAttribute(
    'href',
    practicalCppLessonPath,
  )
  expect(teachingDataRequests).toEqual([])

  await page.getByRole('link', { name: 'Learner record' }).click()
  await expect(page).toHaveURL(/\/profile$/u)
  const courseRecords = page.locator('.station-records__grid > article')
  await expect(courseRecords).toHaveCount(6)
  const practicalCppRecord = courseRecords.filter({
    has: page.getByText('Practical C++: Collections and Records', { exact: true }),
  })
  await expect(practicalCppRecord).toHaveCount(1)
  await expect(practicalCppRecord.getByText('Continuing course', { exact: true })).toBeVisible()
  await expect(practicalCppRecord.getByText('0 / 6', { exact: true })).toBeVisible()
  await expect(practicalCppRecord.getByRole('button', { name: 'Start course' })).toBeVisible()
  expect(teachingDataRequests).toEqual([])
})

test('Practical C++ progress does not take ownership of the prerequisite project portfolio route', async ({ page, seedProgress }) => {
  const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
  await seedProgress({
    ...practicalCppPrerequisites,
    completedMissions: [
      ...practicalCppPrerequisites.completedMissions,
      'cpp-records-return-values',
    ],
  })
  await page.goto('/profile')

  const practicalCppRecord = page.locator('.station-records__grid > article').filter({
    has: page.getByText('Practical C++: Collections and Records', { exact: true }),
  })
  await expect(practicalCppRecord.getByText('1 / 6', { exact: true })).toBeVisible()
  await expect(practicalCppRecord.getByRole('progressbar', {
    name: 'Practical C++: Collections and Records 17% complete',
  })).toBeVisible()
  await expect(practicalCppRecord.getByRole('button', { name: 'Continue course' })).toBeVisible()
  expect(teachingDataRequests).toEqual([])

  await page.goto('/portfolio/cpp/first-compiled-program')

  const heading = page.getByRole('heading', { exact: true, level: 1, name: 'Your First Compiled Program portfolio' })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  await expect(page).toHaveTitle('Your First Compiled Program Portfolio | SeePoundCoffeePie')
  await expect(page.getByText('Practical C++: Collections and Records')).toHaveCount(0)
  expect(teachingDataRequests).toEqual([])
})

test('malformed published teaching data fails closed with a truthful retry page', async ({ page, seedProgress }) => {
  const teachingDataRequests = watchPracticalCppTeachingDataRequests(page)
  await page.route(/\/cpp-collections-records-course-packed\.generated-[^/]+\.json$/u, async (route) => {
    await route.fulfill({
      body: JSON.stringify({ version: 1 }),
      contentType: 'application/json',
      status: 200,
    })
  })
  await seedProgress(practicalCppPrerequisites)
  await page.goto(practicalCppCoursePath)

  const heading = page.getByRole('heading', { exact: true, level: 1, name: 'Practical C++ could not load' })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  await expect(page).toHaveTitle('Practical C++ could not load | SeePoundCoffeePie')
  await expect(page.getByText('Your progress is saved. Check your connection, then try loading the course again.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Modules' })).toHaveCount(0)
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  expect(teachingDataRequests).toHaveLength(1)
})

test('Practice includes authored Practical C++ questions after its first module is complete', async ({ page, seedProgress }) => {
  const learnedFoundationConcept = {
    correct: 4,
    dueAt: '2026-09-30',
    incorrect: 0,
    strength: 5,
  }
  await seedProgress({
    ...practicalCppPrerequisites,
    completedMissions: [
      ...practicalCppPrerequisites.completedMissions,
      'cpp-records-return-values',
    ],
    conceptProgress: Object.fromEntries(
      CPP_FOUNDATION_CONCEPT_IDS.map((conceptId) => [conceptId, learnedFoundationConcept]),
    ),
  })
  await page.goto('/practice/cpp')

  await expect(page.getByRole('heading', { level: 1, name: 'Practice' })).toBeVisible()
  const questions = page.getByRole('list', { name: 'Practice questions' })
  await expect(questions.getByText('return values', { exact: true })).toBeVisible()
  await expect(questions.getByText('returned calculations', { exact: true })).toBeVisible()
  await expect(questions.getByText('From Functions that return answers', { exact: true })).toHaveCount(2)
  await expect(page.getByRole('link', { name: /^Start 5-question review$/u })).toBeVisible()
})

test('the published Code Reference shows exact locked C++ module labels', async ({ page, seedProgress }) => {
  await seedProgress({ activeLanguage: 'cpp' })
  await page.goto('/codebook/cpp')

  await expect(page.getByRole('heading', { level: 1, name: 'Code reference' })).toBeVisible()
  for (const { module, term } of practicalCppCodeReferenceEntries) {
    const entry = await codeReferenceEntry(page, term)
    await expect(entry.getByText('Example not available yet', { exact: true })).toBeVisible()
    await expect(entry).toContainText(`Complete ${module} to see it.`)
  }
})

test('the published Code Reference reveals exact C++ examples after their modules', async ({ page, seedProgress }) => {
  await seedProgress({
    activeLanguage: 'cpp',
    completedMissions: [
      'cpp-records-return-values',
      'cpp-records-vectors',
      'cpp-records-structs',
      'cpp-records-updates',
      'cpp-records-summaries',
    ],
  })
  await page.goto('/codebook/cpp')

  for (const { example, term } of practicalCppCodeReferenceEntries) {
    const entry = await codeReferenceEntry(page, term)
    await expect(entry.getByText('C++ example', { exact: true })).toBeVisible()
    await expect(entry.getByText(example, { exact: true })).toBeVisible()
    await expect(entry.getByText('Example not available yet')).toHaveCount(0)
  }
})
