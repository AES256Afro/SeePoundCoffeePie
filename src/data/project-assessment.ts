import type { ProjectTestCase } from './project-types'
import type { LanguageId } from '../types'

export interface ServerOwnedProjectAssessment {
  language: LanguageId
  referenceSolution: string
  structuralChecks: ServerOwnedProjectStructuralCheck[]
  testCases: ProjectTestCase[]
}

interface ServerOwnedProjectStructuralCheckBase {
  message: string
}

export type ServerOwnedProjectStructuralCheck =
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
