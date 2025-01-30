import { ValidationResult } from './validation-result';

export class StateValidationResult {
  constructor(
    // biome-ignore lint/style/noParameterProperties: <explanation>
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: <explanation>
    public accessToken = '',
    // biome-ignore lint/style/noParameterProperties: <explanation>
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: <explanation>
    public idToken = '',
    // biome-ignore lint/style/noParameterProperties: <explanation>
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: <explanation>
    public authResponseIsValid = false,
    // biome-ignore lint/style/noParameterProperties: <explanation>
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: <explanation>
    public decodedIdToken: any = {
      at_hash: '',
    },
    // biome-ignore lint/style/noParameterProperties: <explanation>
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: <explanation>
    public state: ValidationResult = ValidationResult.NotSet
  ) {}
}
