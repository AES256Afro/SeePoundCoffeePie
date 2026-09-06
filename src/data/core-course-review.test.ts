import { describe, expect, it } from 'vitest'
import { tracks, findExercise } from './curriculum'
import { pythonDataToolsCourse } from './python-data-tools-course'
import { cppCollectionsRecordsDraftModules } from './cpp-collections-records-course-draft'
import { courseDefinitions } from './course-registry'
import { lessonPath, parseAppRoute } from '../lib/routes'

const missions = [
  ...tracks.flatMap((track) => track.missions),
  ...pythonDataToolsCourse.missions,
  ...cppCollectionsRecordsDraftModules,
]
const lessons = missions.flatMap((mission) => mission.exercises)

describe('core course teaching review', () => {
  it('keeps all 180 lessons in one owning course and a bookmarkable route', () => {
    expect(missions).toHaveLength(36)
    expect(lessons).toHaveLength(180)
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(180)
    for (const mission of missions) {
      const owners = courseDefinitions.filter((course) => course.missionIds.includes(mission.id))
      expect(owners, mission.id).toHaveLength(1)
      for (const exercise of mission.exercises) {
        expect(parseAppRoute(lessonPath(owners[0].id, mission.id, exercise.id))).toMatchObject({
          page: 'lesson', courseId: owners[0].id, missionId: mission.id, exerciseId: exercise.id,
        })
      }
    }
  })

  it('uses distinct explanations and bounded tasks instead of duplicated lesson bodies', () => {
    for (const course of courseDefinitions) {
      const exercises = lessons.filter((exercise) => course.lessonIds.includes(exercise.id))
      expect(exercises).toHaveLength(30)
      expect(new Set(exercises.map((exercise) => exercise.explanation.trim())).size, course.id).toBe(30)
      for (const exercise of exercises) {
        expect(exercise.prompt.trim(), exercise.id).not.toBe('')
        if (exercise.type === 'code' || exercise.type === 'bugfix') {
          expect(exercise.focus, exercise.id).toBeTruthy()
          expect(exercise.codeGuide?.length, exercise.id).toBeGreaterThanOrEqual(3)
        }
      }
    }
  })

  it('defines loop punctuation and the running value before asking for a prediction', () => {
    for (const id of ['py4-predict-loop', 'cpp4-predict-loop', 'cs4-predict-loop', 'java4-predict-loop']) {
      const exercise = findExercise(id)!
      expect(exercise.explanation).toMatch(/colon|foreach.*in crew/iu)
      expect(exercise.explanation).toMatch(/pass/iu)
      expect(exercise.explanation).toMatch(/body|repeated instructions/iu)
    }
  })

  it('distinguishes Python string results from list changes and safe dictionary reads', () => {
    const explanation = (id: string) => lessons.find((exercise) => exercise.id === id)!.explanation
    expect(explanation('pydata2-strip-purpose')).toContain('original string unchanged')
    expect(explanation('pydata3-append-purpose')).toContain('returns None')
    expect(explanation('pydata4-fix-missing-key')).toContain('does not add a missing key')
    expect(explanation('pydata5-low-stock')).toContain('keys, not its quantities')
  })

  it('shows function definitions outside main in the first C++ and Java call predictions', () => {
    for (const exercise of [findExercise('cpp5-predict-call')!, findExercise('java5-predict-call')!, lessons.find((item) => item.id === 'cpprecords1-predict-result')!]) {
      expect(exercise.displayCode).toMatch(/main\(/u)
      const definition = exercise.displayCode!.indexOf(exercise.id.startsWith('cpprecords') ? 'int double_units' : 'void announce')
      expect(definition).toBeGreaterThan(-1)
      expect(definition).toBeLessThan(exercise.displayCode!.indexOf('main('))
    }
    expect(findExercise('cs5-predict-call')!.explanation).toContain('local function')
    expect(findExercise('cs5-method-purpose')!.explanation).toContain('A function declared in a class is called a method')
  })
})
