import invoiceEmitter from "../events/invoiceEmitter.js";

export const generateInvoice = async (req, res) => {
  try {
    invoiceEmitter.emit("generateInvoice", req.body);
    res.status(200).json({
      message: "Facture en cours de génération",
      data: req.body,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
