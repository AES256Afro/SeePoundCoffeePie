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
const candidatePrerequisites = {
  completedMissions: [...CPP_FOUNDATION_MISSION_IDS],
  completedProjects: ['first-compiled-program'],
}
const completedCandidateModulesBeforeFinal = [
  'cpp-records-return-values',
  'cpp-records-vectors',
  'cpp-records-structs',
  'cpp-records-updates',
  'cpp-records-summaries',
] as const

const candidateCodeReferenceEntries = [
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

function watchCandidateTeachingDataRequests(page: Page): string[] {
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

async function openCandidateModule(page: Page, moduleNumber: number, title: string): Promise<void> {
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

test('the complete candidate catalog exposes the reviewed sixth course', async ({ page, seedProgress }) => {
  const candidateDataRequests = watchCandidateTeachingDataRequests(page)
  await seedProgress()
  await page.goto('/courses')

  const catalog = page.getByRole('region', { name: 'Courses' })
  await expect(page.getByRole('heading', { level: 1, name: 'Choose a course' })).toBeVisible()
  await expect(catalog.getByRole('article')).toHaveCount(6)
  await expect(catalog.getByRole('heading', { name: 'Practical C++: Collections and Records' })).toBeVisible()
  await expect(catalog.locator(`a[href="${practicalCppCoursePath}"]`)).toHaveCount(1)
  expect(candidateDataRequests).toEqual([])
})

test('the Practical C++ course and direct lesson explain both missing prerequisites', async ({ page, seedProgress }) => {
  const candidateDataRequests = watchCandidateTeachingDataRequests(page)
  await seedProgress()
  await page.goto(practicalCppCoursePath)

  await expect(page.getByRole('heading', { level: 1, name: 'Practical C++: Collections and Records' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Complete these first' })).toBeVisible()
  await expect(page.getByText('Complete C++ Foundations', { exact: true })).toBeVisible()
  await expect(page.getByText('Complete Your First Compiled Program', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Modules' }).getByRole('button')).toHaveCount(6)
  await expect(page.getByRole('link', { name: /^Start course/iu })).toHaveCount(0)
  expect(candidateDataRequests).toHaveLength(1)

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
  expect(candidateDataRequests).toHaveLength(2)
  expect(candidateDataRequests[1]).toBe(candidateDataRequests[0])
})

test('the Practical C++ course opens its first lesson inside the same SPA', async ({ page, seedProgress }) => {
  const candidateDataRequests = watchCandidateTeachingDataRequests(page)
  const documentRequests = watchDocumentRequests(page)
  await seedProgress(candidatePrerequisites)
  await page.goto(practicalCppCoursePath)

  const startCourse = page.getByRole('link', { name: /^Start course/iu })
  await expect(startCourse).toHaveAttribute('href', practicalCppLessonPath)
  await expect(page.getByRole('region', { name: 'Modules' }).getByRole('button')).toHaveCount(6)
  expect(candidateDataRequests).toHaveLength(1)
  expect(documentRequests).toEqual([practicalCppCoursePath])

  await startCourse.click()
  await expectCanonicalLesson(page, practicalCppLessonPath, 'Trace a familiar function call')
  await expect(page.getByText('Lesson locked')).toHaveCount(0)
  expect(candidateDataRequests).toHaveLength(1)
  expect(documentRequests).toEqual([practicalCppCoursePath])
})

test('first, middle, and final candidate lessons share one cached teaching-data request through history', async ({ page, seedProgress }) => {
  const candidateDataRequests = watchCandidateTeachingDataRequests(page)
  const documentRequests = watchDocumentRequests(page)
  await seedProgress({
    ...candidatePrerequisites,
    completedMissions: [
      ...candidatePrerequisites.completedMissions,
      ...completedCandidateModulesBeforeFinal,
    ],
  })
  await page.goto(practicalCppCoursePath)

  await openCandidateModule(page, 1, 'Functions that return answers')
  await page.locator(`a[href="${practicalCppLessonPath}"]`).click()
  await expectCanonicalLesson(page, practicalCppLessonPath, 'Trace a familiar function call')

  await page.getByRole('button', { name: 'Exit lesson' }).click()
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  await openCandidateModule(page, 3, 'Structs that group a record')
  await page.locator(`a[href="${practicalCppMiddleLessonPath}"]`).click()
  await expectCanonicalLesson(page, practicalCppMiddleLessonPath, 'Build and store a part record')

  await page.getByRole('button', { name: 'Exit lesson' }).click()
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  await openCandidateModule(page, 6, 'Build a Workshop Stock Report')
  await page.locator(`a[href="${practicalCppFinalLessonPath}"]`).click()
  await expectCanonicalLesson(page, practicalCppFinalLessonPath, 'Build the Workshop Stock Report')

  expect(candidateDataRequests).toHaveLength(1)
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

  expect(candidateDataRequests).toHaveLength(1)
  expect(documentRequests).toEqual([practicalCppCoursePath])
})

test('direct candidate course and lesson history does not replace the saved language preference', async ({ page, seedProgress }) => {
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

test('Home and Profile own the candidate through compact records without downloading its teaching data', async ({ page, seedProgress }) => {
  const candidateDataRequests = watchCandidateTeachingDataRequests(page)
  await seedProgress(candidatePrerequisites)
  await page.goto('/home')

  const continuation = page.locator('section.continue-panel')
  await expect(continuation.getByText('Your next course', { exact: true })).toBeVisible()
  await expect(continuation.getByRole('heading', { exact: true, name: 'Practical C++: Collections and Records' })).toBeVisible()
  await expect(continuation.getByRole('link', { name: /^Start course/iu })).toHaveAttribute(
    'href',
    practicalCppLessonPath,
  )
  expect(candidateDataRequests).toEqual([])

  await page.getByRole('link', { name: 'Learner record' }).click()
  await expect(page).toHaveURL(/\/profile$/u)
  const courseRecords = page.locator('.station-records__grid > article')
  await expect(courseRecords).toHaveCount(6)
  const candidateRecord = courseRecords.filter({
    has: page.getByText('Practical C++: Collections and Records', { exact: true }),
  })
  await expect(candidateRecord).toHaveCount(1)
  await expect(candidateRecord.getByText('Continuing course', { exact: true })).toBeVisible()
  await expect(candidateRecord.getByText('0 / 6', { exact: true })).toBeVisible()
  await expect(candidateRecord.getByRole('button', { name: 'Start course' })).toBeVisible()
  expect(candidateDataRequests).toEqual([])
})

test('candidate progress does not take ownership of the prerequisite project portfolio route', async ({ page, seedProgress }) => {
  const candidateDataRequests = watchCandidateTeachingDataRequests(page)
  await seedProgress({
    ...candidatePrerequisites,
    completedMissions: [
      ...candidatePrerequisites.completedMissions,
      'cpp-records-return-values',
    ],
  })
  await page.goto('/profile')

  const candidateRecord = page.locator('.station-records__grid > article').filter({
    has: page.getByText('Practical C++: Collections and Records', { exact: true }),
  })
  await expect(candidateRecord.getByText('1 / 6', { exact: true })).toBeVisible()
  await expect(candidateRecord.getByRole('progressbar', {
    name: 'Practical C++: Collections and Records 17% complete',
  })).toBeVisible()
  await expect(candidateRecord.getByRole('button', { name: 'Continue course' })).toBeVisible()
  expect(candidateDataRequests).toEqual([])

  await page.goto('/portfolio/cpp/first-compiled-program')

  const heading = page.getByRole('heading', { exact: true, level: 1, name: 'Your First Compiled Program portfolio' })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  await expect(page).toHaveTitle('Your First Compiled Program Portfolio | SeePoundCoffeePie')
  await expect(page.getByText('Practical C++: Collections and Records')).toHaveCount(0)
  expect(candidateDataRequests).toEqual([])
})

test('malformed candidate teaching data fails closed with a truthful retry page', async ({ page, seedProgress }) => {
  const candidateDataRequests = watchCandidateTeachingDataRequests(page)
  await page.route(/\/cpp-collections-records-course-packed\.generated-[^/]+\.json$/u, async (route) => {
    await route.fulfill({
      body: JSON.stringify({ version: 1 }),
      contentType: 'application/json',
      status: 200,
    })
  })
  await seedProgress(candidatePrerequisites)
  await page.goto(practicalCppCoursePath)

  const heading = page.getByRole('heading', { exact: true, level: 1, name: 'Practical C++ could not load' })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  await expect(page).toHaveTitle('Practical C++ could not load | SeePoundCoffeePie')
  await expect(page.getByText('Your progress is saved. Check your connection, then try loading the course again.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Modules' })).toHaveCount(0)
  await expect(page).toHaveURL(new RegExp(`${practicalCppCoursePath}$`, 'u'))
  expect(candidateDataRequests).toHaveLength(1)
})

test('Practice includes authored Practical C++ questions after its first module is complete', async ({ page, seedProgress }) => {
  const learnedFoundationConcept = {
    correct: 4,
    dueAt: '2026-09-30',
    incorrect: 0,
    strength: 5,
  }
  await seedProgress({
    ...candidatePrerequisites,
    completedMissions: [
      ...candidatePrerequisites.completedMissions,
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

test('the candidate Code Reference shows exact locked C++ module labels', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto('/codebook/cpp')

  await expect(page.getByRole('heading', { level: 1, name: 'Code reference' })).toBeVisible()
  for (const { module, term } of candidateCodeReferenceEntries) {
    const entry = await codeReferenceEntry(page, term)
    await expect(entry.getByText('Example not available yet', { exact: true })).toBeVisible()
    await expect(entry).toContainText(`Complete ${module} to see it.`)
  }
})

test('the candidate Code Reference reveals exact C++ examples after their modules', async ({ page, seedProgress }) => {
  await seedProgress({
    completedMissions: [
      'cpp-records-return-values',
      'cpp-records-vectors',
      'cpp-records-structs',
      'cpp-records-updates',
      'cpp-records-summaries',
    ],
  })
  await page.goto('/codebook/cpp')

  for (const { example, term } of candidateCodeReferenceEntries) {
    const entry = await codeReferenceEntry(page, term)
    await expect(entry.getByText('C++ example', { exact: true })).toBeVisible()
    await expect(entry.getByText(example, { exact: true })).toBeVisible()
    await expect(entry.getByText('Example not available yet')).toHaveCount(0)
  }
})
