import { render } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { expect } from "chai";
import { describe } from "mocha";
import React from "react";

import DokumentRedigeringPage from "../../pages/dokumentredigering/DokumentRedigeringPage";

describe("DokumentRedigeringPage", () => {
    it("should render", async () => {
        render(<DokumentRedigeringPage journalpostId={"JOARK-123213"} />);
        await waitFor(() => expect(document.querySelector(".pdfviewer")).not.to.be.null);
    });
});
