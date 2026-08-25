import { describe, expect, it } from 'vitest'
import { findExercise } from '../data/curriculum'
import { evaluateExercise, evaluateExerciseChecks } from './evaluator'
import type { Exercise } from '../types'

function exercise(id: string) {
  const found = findExercise(id)
  if (!found) throw new Error(`Missing test exercise: ${id}`)
  return found
}

describe('evaluateExercise', () => {
  it('accepts the correct orientation choice', () => {
    expect(evaluateExercise(exercise('py-console'), 'a').correct).toBe(true)
  })

  it('asks the learner to choose before checking', () => {
    expect(evaluateExercise(exercise('py-console'), '')).toEqual({
      correct: false,
      message: 'Choose one answer before checking it.',
    })
  })

  it('explains the selected misconception instead of naming the wrong lesson', () => {
    const result = evaluateExercise(exercise('java-jvm'), 'b')
    expect(result).toEqual({
      correct: false,
      message: 'A critical duty, but Java can do quite a bit more. Reread the explanation above and try once more.',
    })
    expect(result.message).not.toContain('console’s job')
  })

  it('accepts a valid Python print instruction', () => {
    expect(evaluateExercise(exercise('py-print'), 'print("Signal online")')).toMatchObject({
      correct: true,
      output: 'Signal online',
    })
  })

  it('explains a missing Python command', () => {
    const result = evaluateExercise(exercise('py-print'), 'println("Signal online")')
    expect(result.correct).toBe(false)
    expect(result.message).toContain('Use print')
  })

  it('accepts the first C++ output task', () => {
    const answer = '#include <iostream>\nint main() { std::cout << "Reactor online"; return 0; }'
    expect(evaluateExercise(exercise('cpp-output'), answer).correct).toBe(true)
  })

  it('accepts the first C# output task', () => {
    expect(evaluateExercise(exercise('cs-output'), 'Console.WriteLine("Shields online");').correct).toBe(true)
  })

  it('accepts the first Java output task', () => {
    const answer = 'public class Main { public static void main(String[] args) { System.out.println("Coffee online"); } }'
    expect(evaluateExercise(exercise('java-output'), answer).correct).toBe(true)
  })

  it('checks every required part of a final report', () => {
    const incomplete = 'ship_name = "Wayfarer"\npower_cells = 3\nprint("Ship:", ship_name)'
    const result = evaluateExercise(exercise('py-launch'), incomplete)
    expect(result.correct).toBe(false)
    expect(result.message).toContain('power_cells')
  })

  it('reports each authored code requirement separately for the server runner', () => {
    const requirements = evaluateExerciseChecks(
      exercise('py6-void-wyrm'),
      'print("Alert: wyrm")',
    )

    expect(requirements).toHaveLength(3)
    expect(requirements.every((requirement) => !requirement.passed)).toBe(true)
    expect(requirements.map((requirement) => requirement.message)).toEqual([
      'Put hazards after in so the loop visits the complete list.',
      'Pass hazard into report so the function receives the current loop value.',
      'Keep the comparison inside report so only the wyrm triggers the alert.',
    ])
  })

  it('checks output predictions through the authored answer choices', () => {
    const prediction: Exercise = {
      id: 'test-prediction',
      conceptId: 'test-output',
      eyebrow: 'Test',
      title: 'Predict',
      explanation: 'Read from top to bottom.',
      analogy: 'Follow the signal.',
      type: 'prediction',
      prompt: 'What appears?',
      choices: [{ id: 'a', label: 'Online' }, { id: 'b', label: 'Offline', detail: 'That is not the stored message.' }],
      correctChoice: 'a',
      hint: 'Read the print line.',
      recap: 'The stored message appears.',
      xp: 5,
    }

    expect(evaluateExercise(prediction, 'a').correct).toBe(true)
    expect(evaluateExercise(prediction, 'b')).toMatchObject({
      correct: false,
      message: 'That is not the stored message. Reread the explanation above and try once more.',
    })
  })

  it('checks ordered code pieces exactly from top to bottom', () => {
    const ordering: Exercise = {
      id: 'test-ordering',
      conceptId: 'test-conditions',
      eyebrow: 'Test',
      title: 'Order',
      explanation: 'Conditions come before their indented work.',
      analogy: 'Open the hatch before walking through it.',
      type: 'ordering',
      prompt: 'Order the pieces.',
      orderItems: [{ id: 'body', code: '    print("Go")' }, { id: 'if', code: 'if ready:' }],
      correctOrder: ['if', 'body'],
      hint: 'The if line opens the route.',
      recap: 'The condition comes before its indented instruction.',
      xp: 5,
    }

    expect(evaluateExercise(ordering, 'body|if').correct).toBe(false)
    expect(evaluateExercise(ordering, 'if|body')).toMatchObject({ correct: true })
  })

  it('checks bug fixes with the same deterministic syntax rules as editable code', () => {
    const bugfix: Exercise = {
      id: 'test-bugfix',
      conceptId: 'test-comparison',
      eyebrow: 'Test',
      title: 'Repair',
      explanation: 'Two equals signs compare values.',
      analogy: 'Inspect instead of replacing.',
      type: 'bugfix',
      prompt: 'Repair the comparison.',
      starterCode: 'if power = 5:',
      checks: [{ pattern: 'if\\s+power\\s*==\\s*5\\s*:', message: 'Use == to compare the values.' }],
      hint: 'Replace = with ==.',
      recap: 'The comparison now asks a question.',
      xp: 5,
    }

    expect(evaluateExercise(bugfix, 'if power = 5:').correct).toBe(false)
    expect(evaluateExercise(bugfix, 'if power == 5:').correct).toBe(true)
  })

  it.each([
    ['py2-fix-comparison', 'clearance = 7\nif clearance == 7:\n    print("Docking approved")'],
    ['cpp2-fix-comparison', 'int hullIntegrity = 40; if (hullIntegrity == 40) { std::cout << "Breach located"; }'],
    ['cs2-fix-comparison', 'int alertLevel = 3; if (alertLevel == 3) { Console.WriteLine("Battle stations"); }'],
    ['java2-fix-comparison', 'int deckNumber = 4; if (deckNumber == 4) { System.out.println("Galley deck"); }'],
  ])('accepts the authored %s comparison repair', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py2-signal-decision', 'signal_strength = 72\nif signal_strength >= 60:\n    print("Signal accepted")'],
    ['cpp2-hull-decision', 'int hullIntegrity = 35; if (hullIntegrity < 50) { std::cout << "Patch outer hull"; }'],
    ['cs2-shield-decision', 'int shieldPower = 84; if (shieldPower >= 80) { Console.WriteLine("Hold formation"); }'],
    ['java2-pod-decision', 'int podCount = 4; if (podCount < 6) { System.out.println("Restock reserve"); }'],
  ])('accepts the authored %s final condition', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py2-order-route', 'if|accept|else|scan'],
    ['cpp2-order-repair', 'if|low|else|safe|end'],
    ['cs2-order-command', 'if|hold|else|divert|end'],
    ['java2-order-route', 'if|reserve|else|ready|end'],
  ])('accepts the authored %s code order', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py3-fix-index', 'cargo = ["crystal", "medkit", "map"]\nprint(cargo[2])'],
    ['cpp3-fix-index', 'std::string parts[3] = {"crystal", "coupler", "rune"}; std::cout << parts[2];'],
    ['cs3-fix-index', 'string[] crew = { "Mira", "Tov", "Pip" }; Console.WriteLine(crew[2]);'],
    ['java3-fix-index', 'String[] droids = { "MOP-1", "BEEP-7", "HEX-3" }; System.out.println(droids[2]);'],
  ])('accepts the authored %s zero-based index repair', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py3-cargo-report', 'print("First:", cargo[0])\nprint("Last:", cargo[2])'],
    ['cpp3-parts-report', 'std::cout << "First: " << parts[0]; std::cout << "Last: " << parts[2];'],
    ['cs3-roster-report', 'Console.WriteLine($"First: {crew[0]}"); Console.WriteLine($"Last: {crew[2]}");'],
    ['java3-roster-report', 'System.out.println("First: " + droids[0]); System.out.println("Last: " + droids[2]);'],
  ])('accepts the authored %s collection report', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py4-order-loop', 'list|loop|print'],
    ['cpp4-order-loop', 'array|loop|print|end'],
    ['cs4-order-loop', 'array|loop|print|end'],
    ['java4-order-loop', 'array|loop|print|end'],
  ])('accepts the authored %s loop order', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py4-scan-manifest', 'for item in cargo:\n    print("Scanned:", item)'],
    ['cpp4-inspect-parts', 'for (std::string part : parts) { std::cout << "Checked: " << part; }'],
    ['cs4-call-roster', 'foreach (string name in crew) { Console.WriteLine($"Ready: {name}"); }'],
    ['java4-check-roster', 'for (String droid : droids) { System.out.println("Checked: " + droid); }'],
  ])('accepts the authored %s final loop', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py5-order-function', 'define|body|call'],
    ['cpp5-order-function', 'define|body|end|call'],
    ['cs5-order-method', 'define|body|end|call'],
    ['java5-order-method', 'define|body|end|call'],
  ])('accepts the authored %s function order', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py5-report-each', 'def report(current_item):\n    print(current_item)\nfor item in cargo:\n    report(item)'],
    ['cpp5-report-each', 'void report(std::string currentPart) {} for (std::string part : parts) { report(part); }'],
    ['cs5-report-each', 'void Report(string currentName) {} foreach (string name in crew) { Report(name); }'],
    ['java5-report-each', 'static void report(String currentDroid) {} for (String droid : droids) { report(droid); }'],
  ])('accepts the authored %s reusable report', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py6-order-system', 'define|body|list|loop|call'],
    ['cpp6-order-system', 'define|array|loop|call|end'],
    ['cs6-order-system', 'define|array|loop|call|end'],
    ['java6-order-system', 'define|array|loop|call|end'],
  ])('accepts the authored %s capstone assembly', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py6-repair-filter', 'def report(hazard):\n    if hazard == "wyrm":\n        print(hazard)\nreport("wyrm")'],
    ['cpp6-repair-filter', 'void inspect(std::string part) { if (part == "cracked seal") {} } inspect("cracked seal");'],
    ['cs6-repair-scout', 'void Report(string name) { if (name == "Pip") {} } Report("Pip");'],
    ['java6-repair-power', 'static void inspect(int level) { if (level == 25) {} } inspect(25);'],
  ])('accepts the authored %s capstone repair', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })

  it.each([
    ['py6-void-wyrm', 'def report(current_hazard):\n    if current_hazard == "wyrm":\n        print(current_hazard)\nfor hazard in hazards:\n    report(hazard)'],
    ['cpp6-titan-forge', 'if (currentPart == "cracked seal") {} for (std::string part : parts) { inspect(part); }'],
    ['cs6-captains-trial', 'if (currentName == "Pip") {} foreach (string name in crew) { Report(name); }'],
    ['java6-nebula-trial', 'if (currentLevel < 30) {} for (int level : levels) { inspect(level); }'],
  ])('accepts the authored %s final capstone', (id, answer) => {
    expect(evaluateExercise(exercise(id), answer).correct).toBe(true)
  })
})
