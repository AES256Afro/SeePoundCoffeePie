// Phase 5B progress compatibility identifiers. This compact manifest contains
// no teaching copy and does not publish the course, routes, runner assignments,
// Practice material, Codebook examples, or catalog metadata.
export const cppCollectionsRecordsManifest = {
  'cpp-records-return-values': [
    { id: 'cpprecords1-retrieve-call', conceptId: 'cpp-parameters-and-calls', xp: 8 },
    { id: 'cpprecords1-return-purpose', conceptId: 'cpp-return-values', xp: 10 },
    { id: 'cpprecords1-predict-result', conceptId: 'cpp-return-values', xp: 14 },
    { id: 'cpprecords1-fix-return', conceptId: 'cpp-return-values', xp: 16 },
    { id: 'cpprecords1-part-total', conceptId: 'cpp-returned-calculations', xp: 22 },
  ],
  'cpp-records-vectors': [
    { id: 'cpprecords2-retrieve-array', conceptId: 'cpp-collections-and-indexes', xp: 8 },
    { id: 'cpprecords2-vector-purpose', conceptId: 'cpp-vectors', xp: 10 },
    { id: 'cpprecords2-predict-growth', conceptId: 'cpp-vector-growth', xp: 14 },
    { id: 'cpprecords2-fix-push-back', conceptId: 'cpp-vector-growth', xp: 16 },
    { id: 'cpprecords2-add-parts', conceptId: 'cpp-vector-functions', xp: 22 },
  ],
  'cpp-records-structs': [
    { id: 'cpprecords3-retrieve-types', conceptId: 'cpp-variables', xp: 8 },
    { id: 'cpprecords3-struct-purpose', conceptId: 'cpp-structs', xp: 10 },
    { id: 'cpprecords3-predict-fields', conceptId: 'cpp-struct-fields', xp: 14 },
    { id: 'cpprecords3-fix-field-access', conceptId: 'cpp-struct-fields', xp: 16 },
    { id: 'cpprecords3-build-part-record', conceptId: 'cpp-record-construction', xp: 22 },
  ],
  'cpp-records-updates': [
    { id: 'cpprecords4-retrieve-vector-loop', conceptId: 'cpp-vector-functions', xp: 8 },
    { id: 'cpprecords4-reference-purpose', conceptId: 'cpp-references', xp: 10 },
    { id: 'cpprecords4-predict-update', conceptId: 'cpp-reference-updates', xp: 14 },
    { id: 'cpprecords4-fix-copy-update', conceptId: 'cpp-reference-updates', xp: 16 },
    { id: 'cpprecords4-restock-part', conceptId: 'cpp-record-updates', xp: 22 },
  ],
  'cpp-records-summaries': [
    { id: 'cpprecords5-retrieve-return', conceptId: 'cpp-returned-calculations', xp: 8 },
    { id: 'cpprecords5-accumulator-purpose', conceptId: 'cpp-accumulators', xp: 10 },
    { id: 'cpprecords5-order-total', conceptId: 'cpp-record-aggregation', xp: 14 },
    { id: 'cpprecords5-fix-total-reset', conceptId: 'cpp-record-aggregation', xp: 16 },
    { id: 'cpprecords5-low-stock', conceptId: 'cpp-filtering-records', xp: 22 },
  ],
  'cpp-records-workshop-report': [
    { id: 'cpprecords6-trace-stock-update', conceptId: 'cpp-record-updates', xp: 8 },
    { id: 'cpprecords6-plan-report', conceptId: 'cpp-program-planning', xp: 10 },
    { id: 'cpprecords6-order-report', conceptId: 'cpp-record-tool-assembly', xp: 14 },
    { id: 'cpprecords6-fix-low-stock-check', conceptId: 'cpp-record-tool-debugging', xp: 16 },
    { id: 'cpprecords6-workshop-stock-report', conceptId: 'cpp-record-tool-capstone', xp: 22 },
  ],
} as const

export const cppCollectionsRecordsMissionIds = Object.keys(cppCollectionsRecordsManifest)

export const cppCollectionsRecordsLessons = Object.entries(cppCollectionsRecordsManifest).flatMap(
  ([missionId, lessons]) => lessons.map((lesson) => ({ ...lesson, missionId })),
)
