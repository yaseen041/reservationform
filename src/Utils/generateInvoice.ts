import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { UserOptions } from "jspdf-autotable"
import { getCompanyDetails } from "@/Services/GET"
import type { Company } from "./types"
import type { Leads } from "@/Types"

export const generateInvoicePDF = async (lead: Leads) => {
  const company = (await getCompanyDetails(process.env.NEXT_PUBLIC_COMPANYID)) as Company

  console.log(company)

  const doc = new jsPDF() as jsPDF & {
    autoTable: (options: UserOptions) => void
    lastAutoTable: { finalY: number }
  }

  // Add company logo or name
  doc.setFontSize(20)
  doc.text(`${company.data.companyName}`, 105, 15, { align: "center" })

  // Add invoice title
  doc.setFontSize(16)
  doc.text("Invoice", 105, 25, { align: "center" })

  // Add lead details
  doc.setFontSize(12)
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 40)
  doc.text(`Order ID: ${lead.orderId ? lead.orderId : lead.linkedOrderId}`, 20, 50)
  doc.text(`Customer: ${lead.name}`, 20, 60)
  doc.text(`Email: ${lead.email}`, 20, 70)
  doc.text(`Phone: ${lead.phone}`, 20, 80)

  const serviceDetails = [
    ["Service Type", lead.serviceType],
    ["Vehicle Type", lead.vehicleType],
    ["Pickup Date", lead.pickupDate ? lead.pickupDate : ""],
    ["Pickup Time", lead.pickupTime ? lead.pickupTime : ""],
  ]

  // Add pickup location or airport
  if (lead.pickupAirport) {
    serviceDetails.push(["Pickup Airport", lead.pickupAirport])
  } else if (lead.pickupAddress) {
    serviceDetails.push([
      "Pickup Location",
      `${lead.pickupAddress}${lead.pickupCity ? `, ${lead.pickupCity}` : ""}${
        lead.pickupState ? `, ${lead.pickupState}` : ""
      }`,
    ])
  }

  // Add dropoff details
  if (lead.dropoffAirport) {
    serviceDetails.push(["Dropoff Airport", lead.dropoffAirport])
  } else if (lead.dropOffAddress) {
    serviceDetails.push([
      "Dropoff Location",
      `${lead.dropOffAddress}${lead.dropoffCity ? `, ${lead.dropoffCity}` : ""}${
        lead.dropoffState ? `, ${lead.dropoffState}` : ""
      }`,
    ])
  }

  // Add service details
  doc.autoTable({
    startY: 90,
    head: [["Service", "Details"]],
    body: serviceDetails,
  })

  // Calculate pricing
  const basePrice = lead.price || 0
  let discountedPrice = basePrice
  const priceBreakdown = [["Item", "Amount"]]

  // Apply discount if present
  if (lead.discount && lead.discount > 0) {
    const discountAmount = (lead.discount / 100) * basePrice
    discountedPrice = basePrice - discountAmount
    priceBreakdown.push(["Base Price", `$${basePrice.toFixed(2)}`])
    priceBreakdown.push([`Discount (${lead.discount}%)`, `-$${discountAmount.toFixed(2)}`])
    priceBreakdown.push(["Discounted Price", `$${discountedPrice.toFixed(2)}`])
  } else {
    priceBreakdown.push(["Base Price", `$${basePrice.toFixed(2)}`])
  }

  let totalAmount = discountedPrice

  // Fixed amounts from lead
  if (lead.additionalPayments) {
    lead.additionalPayments
      .filter((payment) => payment.paymentType === "fixed")
      .forEach((payment) => {
        priceBreakdown.push([payment.paymentLabel, `$${payment.amount.toFixed(2)}`])
        totalAmount += payment.amount
      })
  }

  // Fixed charges from company (excluding taxes and gratuity)
  if (lead.companyPayments) {
    lead.companyPayments
      .filter((payment) => payment.paymentType === "fixed" && !payment.isTax && !payment.isGratuity)
      .forEach((payment) => {
        priceBreakdown.push([payment.paymentLabel, `$${payment.amount.toFixed(2)}`])
        totalAmount += payment.amount
      })
  }

  // Percentage charges from lead
  if (lead.additionalPayments) {
    lead.additionalPayments
      .filter((payment) => payment.paymentType === "percentage")
      .forEach((payment) => {
        const amount = (payment.amount / 100) * totalAmount
        priceBreakdown.push([`${payment.paymentLabel} (${payment.amount}%)`, `$${amount.toFixed(2)}`])
        totalAmount += amount
      })
  }

  // Percentage charges from company (excluding taxes and gratuity)
  if (lead.companyPayments) {
    lead.companyPayments
      .filter((payment) => payment.paymentType === "percentage" && !payment.isTax && !payment.isGratuity)
      .forEach((payment) => {
        const amount = (payment.amount / 100) * totalAmount
        priceBreakdown.push([`${payment.paymentLabel} (${payment.amount}%)`, `$${amount.toFixed(2)}`])
        totalAmount += amount
      })
  }

  // Apply taxes
  if (lead.companyPayments) {
    lead.companyPayments
      .filter((payment) => payment.isTax)
      .forEach((payment) => {
        const amount = payment.paymentType === "percentage" ? (payment.amount / 100) * discountedPrice : payment.amount
        priceBreakdown.push([
          `${payment.paymentLabel}${payment.paymentType === "percentage" ? ` (${payment.amount}%)` : ""}`,
          `$${amount.toFixed(2)}`,
        ])
        totalAmount += amount
      })
  }

  // Apply gratuity
  if (lead.companyPayments) {
    lead.companyPayments
      .filter((payment) => payment.isGratuity)
      .forEach((payment) => {
        const amount =
          payment.paymentType === "percentage"
            ? (payment.amount / 100) * discountedPrice // Apply gratuity on discounted price
            : payment.amount
        priceBreakdown.push([
          `${payment.paymentLabel}${payment.paymentType === "percentage" ? ` (${payment.amount}%)` : ""}`,
          `$${amount.toFixed(2)}`,
        ])
        totalAmount += amount
      })
  }

  // Add additional gratuity or gratuity
  const additionalGratuityAmount = lead.tip || 0
  if (additionalGratuityAmount > 0) {
    const label = lead.companyPayments?.some((payment) => payment.isGratuity) ? "Additional Gratuity" : "Gratuity"
    priceBreakdown.push([label, `$${additionalGratuityAmount.toFixed(2)}`])
    totalAmount += additionalGratuityAmount
  }

  // Add price breakdown
  const startY = doc.lastAutoTable.finalY + 10
  doc.autoTable({
    startY: startY,
    head: [["Item", "Amount"]],
    body: priceBreakdown,
    foot: [["Grand Total", `$${totalAmount.toFixed(2)}`]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 255, 255] },
    footStyles: { fillColor: [255, 255, 255], fontStyle: "bold", textColor: "black" },
  })

  // Save the PDF
  doc.save(`invoice_${lead._id}.pdf`)
}

