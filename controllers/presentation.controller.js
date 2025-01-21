import Presentation from "../model/Presentation.js";

// Récupérer toutes les présentations avec les articles associés
export const getPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find({}).populate("article");
    res.json(presentations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une nouvelle présentation
export const createPresentation = async (req, res) => {
  try {
    const presentation = new Presentation(req.body);
    const savedPresentation = await presentation.save();
    res.status(201).json(savedPresentation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour une présentation
export const updatePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const presentation = await Presentation.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!presentation) {
      return res.status(404).json({ message: "Présentation non trouvée" });
    }
    res.json(presentation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
