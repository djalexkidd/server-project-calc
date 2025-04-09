function calculerPuissance(espaceDisque, ram, coeurs) {
    const referenceEspace = 1000;
    const referenceRam = 64;
    const referenceCœurs = 8;
    const poidsEspace = 0.40;
    const poidsRam = 0.30;
    const poidsCœurs = 0.30;

    const puissanceEspace = espaceDisque / referenceEspace;
    const puissanceRam = ram / referenceRam;
    const puissanceCœurs = coeurs / referenceCœurs;

    return (puissanceEspace * poidsEspace) + (puissanceRam * poidsRam) + (puissanceCœurs * poidsCœurs);
}

function attribuerBudget(serveurs, budgetTotal) {
  let totalPuissance = 0;

  const puissances = serveurs.map(serveur => {
      const puissance = calculerPuissance(serveur.espaceDisque, serveur.ram, serveur.cœurs);
      totalPuissance += puissance;
      return puissance;
  });

  const budgets = puissances.map(puissance => (puissance / totalPuissance) * budgetTotal);

  // Ajouter le budget à chaque serveur
  serveurs.forEach((serveur, index) => {
      serveur.budgetAttribue = budgets[index];
  });

  // Regrouper les serveurs par projet
  const projets = {};
  serveurs.forEach((serveur) => {
      if (!projets[serveur.projet]) {
          projets[serveur.projet] = {
              total: 0,
              serveurs: []
          };
      }
      projets[serveur.projet].total += serveur.budgetAttribue;
      projets[serveur.projet].serveurs.push(serveur);
  });

  // Affichage
  const resultatEl = document.getElementById('resultat');
  resultatEl.textContent = '';

  for (const [nomProjet, data] of Object.entries(projets)) {
      resultatEl.textContent += `=== Projet : ${nomProjet} ===\n`;
      resultatEl.textContent += `Montant : ${data.total.toFixed(2)} €\n\n`;
      data.serveurs.forEach(serveur => {
          resultatEl.textContent += `Serveur : ${serveur.nom}\n`;
          resultatEl.textContent += `  Espace disque : ${serveur.espaceDisque} Go\n`;
          resultatEl.textContent += `  RAM : ${serveur.ram} Go\n`;
          resultatEl.textContent += `  Cœurs CPU : ${serveur.cœurs}\n`;
          resultatEl.textContent += `  Montant attribué : ${serveur.budgetAttribue.toFixed(2)} €\n\n`;
      });
  }
}

let tousLesServeurs = [];

function traiterFichier(fichier) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      tousLesServeurs = jsonData.map((row) => ({
        nom: row['Nom'],
        projet: row['Projet'],
        espaceDisque: parseFloat(row['Espace utilisé'].replace(' Go', '').replace(',', '.')),
        ram: parseFloat(row['Taille mémoire']),
        cœurs: parseInt(row['CPU'])
      }));
    };
    reader.readAsBinaryString(fichier);
}

document.getElementById('calculerBtn').addEventListener('click', function() {
  const budget = parseFloat(document.getElementById('budgetInput').value);

  if (isNaN(budget) || budget <= 0) {
    alert("Veuillez entrer un budget valide.");
    return;
  }

  if (tousLesServeurs.length > 0) {
    attribuerBudget(tousLesServeurs, budget);
  } else {
    document.getElementById('resultat').textContent = "Aucun serveur trouvé.";
  }
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const fichier = e.target.files[0];
    if (fichier) {
      traiterFichier(fichier);
    }
});

const today = new Date();

document.getElementById('pdfBtn').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (tousLesServeurs.length === 0) {
        alert("Aucun serveur à exporter.");
        return;
    }

    const budget = parseFloat(document.getElementById('budgetInput').value);
    if (isNaN(budget) || budget <= 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }

    // Appliquer le calcul
    attribuerBudget(tousLesServeurs, budget);

    const groupedByProjet = {};

    tousLesServeurs.forEach(s => {
        if (!groupedByProjet[s.projet]) {
            groupedByProjet[s.projet] = {
                total: 0,
                serveurs: []
            };
        }
        groupedByProjet[s.projet].serveurs.push(s);
        groupedByProjet[s.projet].total += s.budgetAttribue;
    });

    Object.entries(groupedByProjet).forEach(([projet, data], index) => {
      let currentY = 20;
  
      if (index === 0) {
          // Première page : titre + budget global
          doc.setFontSize(16);
          doc.text("Facturation", 105, currentY, { align: 'center' });
          currentY += 10;
          doc.setFontSize(12);
          doc.text(`Montant total global : ${budget.toFixed(2)} €`, 105, currentY, { align: 'center' });
          currentY += 20; // Décalage uniquement sur la première page
      } else {
          doc.addPage();
          currentY = 20; // Pas de décalage pour les autres pages
      }
  
      // Titre du projet et total projet
      doc.setFontSize(14);
      doc.text(`Projet : ${projet}`, 14, currentY);
      currentY += 8;
      doc.setFontSize(12);
      doc.text(`Total pour ce projet : ${data.total.toFixed(2)} €`, 14, currentY);
      currentY += 7;
  
      const tableData = data.serveurs.map(s => [
          s.nom,
          s.espaceDisque + ' Go',
          s.ram + ' Go',
          s.cœurs,
          s.budgetAttribue.toFixed(2) + ' €'
      ]);
  
      doc.autoTable({
          startY: currentY,
          head: [['Nom', 'Disque', 'RAM', 'CPU', 'Montant']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [100, 100, 255] },
          margin: { left: 14, right: 14 }
      });
    });

    doc.save(`facture_${today.toISOString().split('T')[0]}.pdf`);
});