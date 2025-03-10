export function getVerifyAlg(
  alg: string
): RsaHashedImportParams | EcdsaParams | null {
  switch (alg.charAt(0)) {
    case 'R':
      return {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      };
    case 'E': {
      if (alg.includes('256')) {
        return {
          name: 'ECDSA',
          hash: 'SHA-256',
        };
      }
      if (alg.includes('384')) {
        return {
          name: 'ECDSA',
          hash: 'SHA-384',
        };
      }
      return null;
    }
    default:
      return null;
  }
}

export function alg2kty(alg: string): string {
  switch (alg.charAt(0)) {
    case 'R':
      return 'RSA';

    case 'E':
      return 'EC';

    default:
      throw new Error(`Cannot infer kty from alg: ${alg}`);
  }
}

export function getImportAlg(
  alg: string
): RsaHashedImportParams | EcKeyImportParams | null {
  switch (alg.charAt(0)) {
    case 'R': {
      if (alg.includes('256')) {
        return {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        };
      }
      if (alg.includes('384')) {
        return {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-384',
        };
      }
      if (alg.includes('512')) {
        return {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-512',
        };
      }
      return null;
    }
    case 'E': {
      if (alg.includes('256')) {
        return {
          name: 'ECDSA',
          namedCurve: 'P-256',
        };
      }
      if (alg.includes('384')) {
        return {
          name: 'ECDSA',
          namedCurve: 'P-384',
        };
      }
      return null;
    }
    default:
      return null;
  }
}
