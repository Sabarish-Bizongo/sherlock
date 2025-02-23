const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const JIRA_BASE_URL = "https://bizongo.atlassian.net"; 
// Directly set the JIRA_AUTH token (Base64 encoded credentials)
// (This token must exactly match the one that worked in your cURL request)
const JIRA_AUTH = "Basic amlyYS5hdXRvbWF0aW9uQGJpem9uZ28uY29tOkFUQVRUM3hGZkdGMGhQa1pKNDc5LTd5N0RMWXpobENVaXJaNXlBY1JaTEViMVBFUWk3UHFTYTIzV3k3TEx6R0VEcHk2YTd0T1Uycm15OFByWklwcjhwVndsZmk3UXBMUEtkMnpNVXN1TTNPdXlDbkVHa2xrTFdYYU83M010MnF1WGNrM0IwZUZNVXlkZFluM0xiRUxaNHJhREhJcXN6WVpZQWYwamhoZ0tRR1NaVmZKUXZHLVZ2dz04MUU0MkY2NQ";

async function updateJira(issueKey, updateData) {
    console.log("🚀 updateJira() function called!");
    console.log("🔗 Issue Key:", issueKey);
    console.log("📩 Update Data:", JSON.stringify(updateData, null, 2));

    try {
        const response = await axios.put(
            `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`,
            updateData,
            {
                headers: {
                    Authorization: JIRA_AUTH,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ JIRA Update Successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ JIRA API Error:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        throw new Error("Failed to update JIRA");
    }
}

app.post("/submit-form", async (req, res) => {
    try {
        const { deliveryId, poNumber, sellerInvoice, jiraTicketId, sellerEwbNumber, netWeight, numberOfPieces, materialQualityCheck, matchMaterialWithPo, matchMaterialChemicalCompositionWithSpo, matchNetWeightWithWeightSlip } = req.body;
        console.log("🚀 submit-form called!");
        console.log("📌 Received Data:", req.body);

        const updatePayload = {
            fields: {
                description: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", text: `Purchase Order Number: ${poNumber}` },
                                { type: "hardBreak" },
                                { type: "text", text: `Delivery ID: ${deliveryId}` },
                                { type: "hardBreak" },
                                { type: "text", text: `Seller Invoice Number: ${sellerInvoice}` },
                                { type: "hardBreak" },
                                { type: "text", text: `Seller EWB Number: ${sellerEwbNumber}` },
                                { type: "hardBreak" },
                                { type: "text", text: `Net Weight: ${netWeight}` },
                                { type: "hardBreak" },
                                { type: "text", text: `Number of Pieces: ${numberOfPieces}` }
                            ]
                        },
                        {
                            type: "paragraph",
                            content: [
                                { type: "hardBreak" },
                                { type: "text", text: `✅ Material Quality Check: ${materialQualityCheck}` },
                                { type: "hardBreak" },
                                { type: "text", text: `✅ Match Material with Purchase Order: ${matchMaterialWithPo}` },
                                { type: "hardBreak" },
                                { type: "text", text: `✅ Match Material Chemical Composition with SPO: ${matchMaterialChemicalCompositionWithSpo}` },
                                { type: "hardBreak" },
                                { type: "text", text: `✅ Match Net Weight of Seller Invoice with Weight Slip: ${matchNetWeightWithWeightSlip}` }
                            ]
                        },
                        {
                            type: "paragraph",
                            content: [
                                { type: "hardBreak" },
                                { type: "text", text: "🚚 Delivery Link: " },
                                { type: "text", text: "Click Here", marks: [{ type: "link", attrs: { href: `https://internal.bizongo.com/app/order-management/shipments/${deliveryId}` }}] }
                            ]
                        }
                    ]
                },
                customfield_11191: "MH12AB1234",
                customfield_11192: "9689858958",
                customfield_11193: deliveryId
            }
        };


        await updateJira(jiraTicketId, updatePayload);
        res.status(200).json({ message: "✅ JIRA updated successfully" });
    } catch (error) {
        console.error("❌ JIRA API Error:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({ error: "Failed to update JIRA", details: error.message });
    }
});

app.put('/update-jira', async (req, res) => {
    console.log("🚀 API /update-jira called!");
    
    try {
        const { issueKey, updateData } = req.body;
        console.log("📌 Received Data:", req.body);

        const result = await updateJira(issueKey, updateData);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("❌ API Error:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({ 
            error: "Failed to update JIRA", 
            details: error.response ? error.response.data : error.message 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
