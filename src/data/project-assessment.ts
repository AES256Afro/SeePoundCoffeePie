import type { ProjectTestCase } from './project-types'
import type { LanguageId } from '../types'

export type ServerOwnedAssessmentProfile = 'python-data-tools-supply-tracker-v1'

export interface ServerOwnedRunnerAssessment {
  language: LanguageId
  structuralChecks: ServerOwnedRunnerStructuralCheck[]
  testCases: ProjectTestCase[]
  analysisProfile?: ServerOwnedAssessmentProfile
}

export interface ServerOwnedProjectAssessment extends ServerOwnedRunnerAssessment {
  referenceSolution: string
}

interface ServerOwnedProjectStructuralCheckBase {
  message: string
}

export type ServerOwnedRunnerStructuralCheck =
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-data-tools-authored-frame'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-data-tools-normalize-name'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-data-tools-add-stock'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-data-tools-total-stock'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-data-tools-low-stock'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-data-tools-harness'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-assignment-integer'
      target: string
      value: number
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-assignment-input'
      target: string
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-assignment-int-name'
      target: string
      name: string
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-assignment-multiply-names'
      target: string
      names: [string, string]
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'python-print-f-string'
      requiredFields: string[]
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-required-headers'
      headers: string[]
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-main-return-zero'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-declaration-integer'
      target: string
      value: number
      statement: number
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-declaration-string'
      target: string
      statement: number
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-getline'
      target: string
      statement: number
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-integer-extraction'
      target: string
      initialValue: number
      declarationStatement: number
      inputStatement: number
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-declaration-multiply-names'
      target: string
      names: [string, string]
      statement: number
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'cpp-output-chain'
      requiredFields: string[]
      statement: number
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-using-system'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-print-badge'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-areas-array'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-console-inputs'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-membership-branch'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-area-foreach'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-print-badge-call'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'csharp-top-level-order'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-scanner-import'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-main-frame'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-print-picnic'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-scanner-setup'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-supplies-array'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-console-inputs'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-table-branch'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-supply-foreach'
    }
  | ServerOwnedProjectStructuralCheckBase & {
      validation: 'java-main-statement-order'
    }

export type ServerOwnedProjectStructuralCheck = ServerOwnedRunnerStructuralCheck
