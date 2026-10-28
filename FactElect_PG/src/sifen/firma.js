import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';

// Lee un certificado PKCS#12 (.p12/.pfx) y devuelve clave y certificado en PEM.
export function leerP12(buffer, password) {
  const asn1 = forge.asn1.fromDer(forge.util.createBuffer(buffer.toString('binary')));
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
  const bolsaClave =
    p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0] ||
    p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]?.[0];
  const bolsaCert = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag]?.[0];
  if (!bolsaClave || !bolsaCert) throw new Error('El archivo .p12 no contiene clave privada y certificado');

  const cert = bolsaCert.cert;
  return {
    clave: forge.pki.privateKeyToPem(bolsaClave.key),
    certificado: forge.pki.certificateToPem(cert),
    titular: cert.subject.getField('CN')?.value || '',
    serie: cert.subject.getField('serialNumber')?.value || '',
    validoDesde: cert.validity.notBefore.toISOString(),
    validoHasta: cert.validity.notAfter.toISOString(),
  };
}

// Certificado autofirmado para el modo simulado (nunca válido ante la DNIT).
export function certificadoDePrueba(nombre = 'FACTELECT_PG PRUEBA', password = 'prueba') {
  const claves = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = claves.publicKey;
  cert.serialNumber = '01' + forge.util.bytesToHex(forge.random.getBytesSync(8));
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(Date.now() + 365 * 24 * 3600 * 1000);
  const attrs = [{ name: 'commonName', value: nombre }, { name: 'countryName', value: 'PY' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(claves.privateKey, forge.md.sha256.create());
  const p12 = forge.pkcs12.toPkcs12Asn1(claves.privateKey, [cert], password, { algorithm: '3des' });
  return Buffer.from(forge.asn1.toDer(p12).getBytes(), 'binary');
}

const ALG = {
  c14n: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
  rsaSha256: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  sha256: 'http://www.w3.org/2001/04/xmlenc#sha256',
  enveloped: 'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
  excC14n: 'http://www.w3.org/2001/10/xml-exc-c14n#',
};

// Firma XMLDSig enveloped según el punto 7.6 del Manual Técnico: la firma va
// inmediatamente después del nodo firmado (DE en documentos, rEve en eventos).
export function firmarXml(xml, { clave, certificado }, nodo = 'DE') {
  const sig = new SignedXml({
    privateKey: clave,
    publicCert: certificado,
    signatureAlgorithm: ALG.rsaSha256,
    canonicalizationAlgorithm: ALG.c14n,
  });
  const xpath = `//*[local-name(.)='${nodo}']`;
  sig.addReference({ xpath, digestAlgorithm: ALG.sha256, transforms: [ALG.enveloped, ALG.excC14n] });
  sig.computeSignature(xml, { location: { reference: xpath, action: 'after' } });
  const firmado = sig.getSignedXml();
  const digest = /<DigestValue>([^<]+)<\/DigestValue>/.exec(firmado)[1];
  return { xml: firmado, digestValue: digest };
}
