import { EventEmitter } from "events";
import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import logger from "../config/logger.js";

const invoiceEmitter = new EventEmitter();

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

invoiceEmitter.on("generateInvoice", (data) => {
  const doc = new PDFDocument();

  // Création du dossier invoices s'il n'existe pas
  const invoicesDir = "documents/invoices";
  ensureDirectoryExists(invoicesDir);

  // Format du nom de fichier: YYYYMMDD-HHMMSS-numeroFacture.pdf
  const dateStr = new Date()
    .toISOString()
    .replace(/[:-]/g, "")
    .split(".")[0]
    .replace("T", "-");

  const filename = path.join(
    invoicesDir,
    `${dateStr}-${data.numeroFacture}.pdf`
  );

  doc.pipe(fs.createWriteStream(filename));

  // En-tête
  doc.fontSize(30).text("FACTURE", { align: "center" });
  doc.moveDown();

  // Informations de base
  doc
    .fontSize(14)
    .text(`Numéro de facture: ${data.numeroFacture}`, { align: "left" })
    .text(`Date: ${data.dateFacture}`, { align: "left" });
  doc.moveDown(2);

  // Configuration des colonnes
  const leftColumnX = 50;
  const rightColumnX = doc.page.width / 2 + 50;
  const startY = doc.y;

  // Émetteur (colonne gauche)
  doc.fontSize(16).text("ÉMETTEUR", leftColumnX, startY);
  doc.fontSize(14);
  doc.text(data.entrepriseEmettrice.nom, leftColumnX, startY + 30);
  doc.text(data.entrepriseEmettrice.adresse, leftColumnX);
  doc.text(
    `${data.entrepriseEmettrice.codePostal} ${data.entrepriseEmettrice.ville}`
  );
  doc.text(`SIRET: ${data.entrepriseEmettrice.siret}`);
  doc.text(`Tél: ${data.entrepriseEmettrice.telephone}`);
  doc.text(`Email: ${data.entrepriseEmettrice.email}`);

  // Client (colonne droite)
  doc.fontSize(16).text("CLIENT", rightColumnX, startY);
  doc.fontSize(14);
  doc.text(data.client.nom, rightColumnX, startY + 30);
  doc.text(data.client.adresse, rightColumnX);
  doc.text(`${data.client.codePostal} ${data.client.ville}`);
  doc.text(`Tél: ${data.client.telephone}`);
  doc.text(`Email: ${data.client.email}`);

  // Positionnement pour la suite
  doc.moveDown(4);

  // Tableau des prestations
  doc.fontSize(16).text("DÉTAIL DES PRESTATIONS", { underline: true });
  doc.moveDown();

  // En-tête du tableau
  const tableTop = doc.y;
  const descriptionX = 50;
  const quantiteX = 300;
  const prixX = 400;
  const totalX = 500;

  doc
    .fontSize(12)
    .text("Description", descriptionX, tableTop)
    .text("Quantité", quantiteX, tableTop)
    .text("Prix unitaire", prixX, tableTop)
    .text("Total HT", totalX, tableTop);

  doc.moveDown();

  // Contenu du tableau
  data.prestations.forEach((prestation) => {
    const y = doc.y;
    doc
      .text(prestation.description, descriptionX, y)
      .text(prestation.quantite.toString(), quantiteX, y)
      .text(`${prestation.prixUnitaire}€`, prixX, y)
      .text(`${prestation.montantHT}€`, totalX, y);
    doc.moveDown();
  });

  doc.moveDown(2);

  // Section paiement (deux colonnes)
  const paymentY = doc.y;

  // Informations de paiement (gauche)
  doc.fontSize(14).text("INFORMATIONS DE PAIEMENT", leftColumnX, paymentY);
  doc.moveDown();
  doc
    .fontSize(12)
    .text(`Conditions: ${data.paiement.conditions}`, leftColumnX)
    .text(`IBAN: ${data.paiement.iban}`, leftColumnX)
    .text(`BIC: ${data.paiement.bic}`, leftColumnX);

  // Récapitulatif (droite)
  doc.fontSize(14).text("RÉCAPITULATIF", rightColumnX, paymentY);
  doc.moveDown();
  doc
    .fontSize(12)
    .text(`Total HT: ${data.paiement.totalHT}€`, rightColumnX)
    .text(
      `TVA (${data.paiement.tva}%): ${data.paiement.montantTVA}€`,
      rightColumnX
    )
    .text(`Total TTC: ${data.paiement.totalTTC}€`, rightColumnX, undefined, {
      bold: true,
    });

  // Pied de page
  doc.fontSize(12).text("Merci de votre confiance", { align: "center" });

  doc.end();
  logger.info(`Facture générée: ${filename}`);
});

export default invoiceEmitter;
