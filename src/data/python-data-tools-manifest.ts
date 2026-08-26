// Phase 5A learner-record identifiers. This compact manifest intentionally
// contains no teaching copy so progress validation does not pull the lazy
// Practical Python course into the initial browser bundle.
export const pythonDataToolsManifest = {
  'py-data-return-values': [
    { id: 'pydata1-retrieve-call', conceptId: 'python-parameters-and-calls', xp: 8 },
    { id: 'pydata1-return-purpose', conceptId: 'python-return-values', xp: 10 },
    { id: 'pydata1-predict-result', conceptId: 'python-return-values', xp: 14 },
    { id: 'pydata1-fix-return', conceptId: 'python-return-values', xp: 16 },
    { id: 'pydata1-subtotal', conceptId: 'python-returned-calculations', xp: 22 },
  ],
  'py-data-text-cleanup': [
    { id: 'pydata2-retrieve-format', conceptId: 'project-python-f-strings', xp: 8 },
    { id: 'pydata2-strip-purpose', conceptId: 'python-string-methods', xp: 10 },
    { id: 'pydata2-predict-cleanup', conceptId: 'python-string-normalization', xp: 14 },
    { id: 'pydata2-fix-method-call', conceptId: 'python-string-normalization', xp: 16 },
    { id: 'pydata2-normalize-name', conceptId: 'python-normalization-functions', xp: 22 },
  ],
  'py-data-list-tools': [
    { id: 'pydata3-retrieve-loop', conceptId: 'python-loops-and-collections', xp: 8 },
    { id: 'pydata3-append-purpose', conceptId: 'python-list-mutation', xp: 10 },
    { id: 'pydata3-predict-length', conceptId: 'python-list-length', xp: 14 },
    { id: 'pydata3-fix-membership', conceptId: 'python-membership-tests', xp: 16 },
    { id: 'pydata3-add-unique', conceptId: 'python-list-functions', xp: 22 },
  ],
  'py-data-dictionaries': [
    { id: 'pydata4-retrieve-list-change', conceptId: 'python-list-functions', xp: 8 },
    { id: 'pydata4-dictionary-purpose', conceptId: 'python-dictionaries', xp: 10 },
    { id: 'pydata4-predict-lookup', conceptId: 'python-dictionary-lookup', xp: 14 },
    { id: 'pydata4-fix-missing-key', conceptId: 'python-dictionary-defaults', xp: 16 },
    { id: 'pydata4-add-stock', conceptId: 'python-dictionary-updates', xp: 22 },
  ],
  'py-data-summaries': [
    { id: 'pydata5-retrieve-update', conceptId: 'python-dictionary-updates', xp: 8 },
    { id: 'pydata5-accumulator-purpose', conceptId: 'python-accumulators', xp: 10 },
    { id: 'pydata5-order-total', conceptId: 'python-dictionary-iteration', xp: 14 },
    { id: 'pydata5-fix-total-reset', conceptId: 'python-accumulators', xp: 16 },
    { id: 'pydata5-low-stock', conceptId: 'python-filtering-collections', xp: 22 },
  ],
  'py-data-supply-tracker': [
    { id: 'pydata6-trace-stock-update', conceptId: 'python-dictionary-updates', xp: 8 },
    { id: 'pydata6-plan-tracker', conceptId: 'python-program-planning', xp: 10 },
    { id: 'pydata6-order-tracker', conceptId: 'python-data-tool-assembly', xp: 14 },
    { id: 'pydata6-fix-normalized-key', conceptId: 'python-data-tool-debugging', xp: 16 },
    { id: 'pydata6-supply-tracker', conceptId: 'python-data-tool-capstone', xp: 22 },
  ],
} as const

export const pythonDataToolsMissionIds = Object.keys(pythonDataToolsManifest)

export const pythonDataToolsLessons = Object.entries(pythonDataToolsManifest).flatMap(
  ([missionId, lessons]) => lessons.map((lesson) => ({ ...lesson, missionId })),
)

