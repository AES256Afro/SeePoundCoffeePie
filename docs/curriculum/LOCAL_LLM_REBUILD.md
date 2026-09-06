# Local LLM curriculum: active implementation

6 September 2026. This is the active learner-facing local LLM sequence. It supersedes the generic first-release packet as the implementation guide. The larger historical blueprint is an idea backlog, not a second course catalog or a claim that 65 courses are published.

## Scope

Six open courses, 21 authored lessons, 21 distinct worked examples, 21 practice tasks, and 21 formative knowledge checks. Approximate study time: four to six hours including practice and breaks. Optional local work adds time that depends on hardware and downloads. No completion gate, account, diagnosis category, paid API, model inference, or training service is added.

The first course replaces the old six generic model-classification lessons. It does not sit beside a duplicate introductory path. Existing path, course, module, and unit URLs remain valid. New unit and module IDs prevent old generic-course credit from implying completion of materially different material. Old progress IDs remain accepted as historical records; other course progress is unchanged.

## Course sequence and evidence

| Course | Distinct lessons | Learner evidence |
| --- | --- | --- |
| Local LLMs: what they do | What a local LLM does; tokens and context; weights versus inference; model files and applications; useful jobs; local versus hosted reality checks | A bounded use case and an explanation of what it can and cannot establish |
| Choose and run a local LLM | Model cards and model types; memory and quantization; first local run | Candidate record, raw memory estimate with limits, and a first-run plan |
| Use and test local LLMs | Repeatable prompts; coding and tool permissions; evaluation | A task prompt, a safe execution boundary, and a fair comparison |
| Give an LLM your documents | Context versus retrieval versus training; document search; evidence and access checks | A question-to-source trace including missing, stale, and hostile-input cases |
| Train open-weight models | Training methods; dataset preparation; LoRA, QLoRA, and full tuning | Data split, bounded adaptation plan, and baseline-versus-adapter decision |
| Build a language model from scratch | Training loop; tiny experiments; packaging and iteration | A learning experiment, held-out measurement, and a reproducible artifact checklist |

## Labs

The public [six-lab workbook](../../public/learning-labs/local-llms.md) is downloadable from the path page. It offers a no-install route, optional native local inference on Windows/macOS/Linux, document retrieval by hand, a hardware-dependent adapter experiment plan, and a dependency-free Python character baseline.

The [tiny baseline](../../public/learning-labs/tiny-language-baseline.py) deliberately is not an LLM. It exists to observe learning and held-out loss without downloading a model. It must never be described as a transformer, neural training, or production assistant.

Training installation and LoRA execution are not claimed tested on learner hardware. The workbook links official TRL, PEFT, quantization, and runtime guidance and asks learners to record versions and compatibility. No universal training installer is promised.

## De-duplication rules

- Tokens and weights have one primary introduction. Later pages briefly define only the words their exercise needs.
- Local-versus-hosted comparison has one primary lesson, not another parallel school of repeated introductions.
- Adding documents belongs to the retrieval course. It is explicitly not described as training the language model.
- Fine-tuning and from-scratch training have different starting weights, data, resource assumptions, and outcomes.
- Model choice, evaluation, and packaging are different tasks. Shared caution text does not become another course.
- Historical planned courses may be expanded only if they add a distinct practical outcome, not by copying a lesson template into multiple catalog cards.

## Navigation acceptance

- Every course, module, unit, and refresher resolves from its full bookmark URL.
- Each Next unit link leads to different lesson content, including across a module boundary.
- The last unit names the next course; the final course returns to the path.
- Previous unit links reverse the in-course order.
- A new unit resets unsent answers and feedback. Browser Back and refresh retain route identity.
- All advanced courses remain directly open to guests.
- The sitemap includes every published academy route once.
- No runner, inference, or training request occurs while reading or checking these lessons.

## Next expansion, without duplicating this foundation

1. A version-pinned, locally tested supervised adapter lab for one named supported hardware route, plus prepared output for everyone else. Add a tested setup/recovery guide before calling it executable across platforms.
2. A small local document assistant project with document revision handling, citations, access filtering, and a reproducible evaluation set.
3. A tiny randomly initialized transformer lab with fixed data, bounded resources, learning curves, and held-out samples. Keep it separate from the character baseline.
4. A preference-data lab covering DPO and reward failures, followed by a distillation comparison with permission checks.
5. A capstone that asks learners to choose prompt-only, retrieval, or tuning based on evidence. Certificates of completion must not imply independent professional certification or verified hardware execution.

## Transfer and cost boundary

The expanded lesson prose is still loaded behind the academy route. The measured academy chunk is approximately 107.58 kB raw / 31.19 kB gzip. Course metadata and short optional preparation records are shared with navigation. Initial JavaScript retains its existing budget and passes it. Total lazy content budgets are explicitly increased for the 15 additional lessons, not hidden by moving file types.

The optional workbook and Python file are static downloads. No model weights, paid services, recurring jobs, infrastructure changes, or model execution are part of this content update.

## Verification record

- 1,078 unit/integration tests passed across 89 files.
- 75 browser checks passed, including a traversal of all 21 lessons, course transitions, bookmarks, refresh, Back, keyboard quiz retry, and a 320px accessibility scan.
- Build, lint, bundle budget, curriculum validation, learner-language checks, and whitespace checks passed.
- The dependency-free Python baseline ran locally. Its embedded example reduced held-out next-character loss from 3.367 to 1.472. This is evidence for that tiny baseline only, not for LLM training or tuning.
- No actual LLM inference, adapter training, or transformer training was executed. Cloudflare settings, deployments, runner state, and paid services were not changed.
- These are local implementation results. No commit, push, staging publication, or production publication is claimed by this record.
