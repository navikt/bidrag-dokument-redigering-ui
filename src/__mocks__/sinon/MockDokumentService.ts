import sinon, { SinonSandbox } from "sinon";

import DokumentService from "../../service/DokumentService";
const dokumentBase64 =
    "JVBERi0xLjQKJcOiw6PDj8OTCjUgMCBvYmoKPDwKL0xlbmd0aCAxCj4+CnN0cmVhbQogCmVuZHN0cmVhbQplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA1IDAgUgovUGFyZW50IDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNCAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PAovQ3JlYXRvciAoUERGIENyZWF0b3IgaHR0cDovL3d3dy5wZGYtdG9vbHMuY29tKQovQ3JlYXRpb25EYXRlIChEOjIwMTUwNzAxMTEyNDQ3KzAyJzAwJykKL01vZERhdGUgKEQ6MjAyMjA2MDcxODM2MDIrMDInMDAnKQovUHJvZHVjZXIgKDMtSGVpZ2h0c1wyMjIgUERGIE9wdGltaXphdGlvbiBTaGVsbCA2LjAuMC4wIFwoaHR0cDovL3d3dy5wZGYtdG9vbHMuY29tXCkpCj4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDIyNiAwMDAwMCBuCjAwMDAwMDAxNjkgMDAwMDAgbgowMDAwMDAwMjc1IDAwMDAwIG4KMDAwMDAwMDA2NSAwMDAwMCBuCjAwMDAwMDAwMTUgMDAwMDAgbgp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKL0luZm8gMyAwIFIKL0lEIFs8MUMzNTAwQ0E5RjcyMzJCOTdFMEVGM0Y3ODlFOEI3RjI+IDwyNTRDOEQxNTNGNjU1RDQ5OTQ1RUFENjhEODAxRTAxMT5dCj4+CnN0YXJ0eHJlZgo1MDUKJSVFT0Y=";
export function mockHentDokument(sinonSandbox: SinonSandbox = sinon.createSandbox()) {
    sinonSandbox.stub(DokumentService.prototype, "getDokument").callsFake(() => {
        return Promise.resolve(dokumentBase64);
    });

    sinonSandbox.stub(DokumentService.prototype, "getDokumenter").callsFake(() => {
        return Promise.resolve(dokumentBase64);
    });

    return sinonSandbox;
}
