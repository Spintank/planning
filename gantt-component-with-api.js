// components/GanttChart.jsx (version avec API)
"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

const GanttChart = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  
  // Couleurs pour les différentes phases
  const phaseColors = {
    'Lancement': '#FF9800',
    'Cadrage': '#03A9F4',
    'Conception': '#9C27B0',
    'Développement': '#4CAF50',
    'Recette': '#FFC107', 
    'Mise en ligne': '#E91E63',
    'Autre': '#607D8B'
  };
  
  // Couleurs pour les différents statuts
  const statusColors = {
    'Terminé': '#4CAF50',
    'En cours': '#2196F3',
    'Pas commencé': '#9E9E9E',
    '': '#FFC107'
  };
  
  // Définition des mots-clés pour chaque phase
  const phaseKeywords = {
    'Lancement': ['entretien', 'kick', 'démarrage', 'lancement', 'stratégi'],
    'Cadrage': ['cadrage', 'atelier', 'note de cadrage', 'poc', 'proof of concept'],
    'Conception': ['spec', 'conception', 'wireframe', 'maquette', 'design', 'ux', 'ui'],
    'Développement': ['dev', 'développement', 'code', 'implementation', 'intégration'],
    'Recette': ['recette', 'test', 'qa', 'qualité'],
    'Mise en ligne': ['déploiement', 'livraison', 'mise en prod', 'go live', 'prod']
  };

  // Fonction pour convertir les mois français en anglais
  const replaceFrenchMonths = (dateStr) => {
    if (!dateStr) return null;
    
    const moisFrToEn = {
      "janvier": "January", "février": "February", "mars": "March", "avril": "April",
      "mai": "May", "juin": "June", "juillet": "July", "août": "August",
      "septembre": "September", "octobre": "October", "novembre": "November", "décembre": "December"
    };
    
    let result = dateStr;
    for (const [fr, en] of Object.entries(moisFrToEn)) {
      result = result.replace(new RegExp(fr, 'gi'), en);
    }
    return result;
  };

  // Fonction pour analyser les plages de dates
  const parseDateRange = (dateStr) => {
    if (!dateStr || dateStr.toLowerCase() === 'nan') return null;
    
    const cleanedDateStr = replaceFrenchMonths(dateStr);
    const parts = cleanedDateStr.split('→');
    
    if (parts.length === 2) {
      try {
        const startParts = parts[0].trim().split(' ');
        const endParts = parts[1].trim().split(' ');
        
        const startDate = new Date(`${startParts[1]} ${startParts[0]}, ${startParts[2]}`);
        const endDate = new Date(`${endParts[1]} ${endParts[0]}, ${endParts[2]}`);
        
        return { start: startDate, end: endDate };
      } catch (e) {
        console.error(`Erreur lors de l'analyse de la date: ${dateStr}`, e);
        return null;
      }
    } else {
      try {
        const dateParts = parts[0].trim().split(' ');
        const date = new Date(`${dateParts[1]} ${dateParts[0]}, ${dateParts[2]}`);
        return { start: date, end: date };
      } catch (e) {
        console.error(`Erreur lors de l'analyse de la date: ${dateStr}`, e);
        return null;
      }
    }
  };

  // Fonction pour déterminer la phase d'une tâche
  const determinePhase = (taskName) => {
    if (!taskName) return 'Autre';
    
    const lowerName = taskName.toLowerCase();
    
    for (const [phase, keywords] of Object.entries(phaseKeywords)) {
      if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
        return phase;
      }
    }
    
    return 'Autre';
  };

  // Fonction pour traiter les données
  const processData = (data) => {
    return data
      .map((row, index) => {
        const dateRange = parseDateRange(row["Date (OLD utiliser Dates)"]);
        if (!dateRange) return null;
        
        const taskName = row.Nom || 'Sans nom';
        const phase = determinePhase(taskName);
        
        return {
          id: index,
          name: taskName,
          status: row["Statut "] ? row["Statut "].trim() : "",
          startDate: dateRange.start,
          endDate: dateRange.end,
          responsible: row.Responsable || "",
          phase: phase
        };
      })
      .filter(Boolean);
  };

  // Formater les dates en français
  const formatDate = (date) => {
    if (!date) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Calculer la durée en jours
  const getDurationDays = (start, end) => {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calcule la position X en pixels pour une date donnée
  const getPositionX = (date) => {
    if (!minDate || !maxDate) return 0;
    
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 30; // Ajouter marge
    const dayWidth = 800 / totalDays; // 800px est la largeur fixe du diagramme
    
    const daysSinceStart = Math.ceil((date - minDate) / (1000 * 60 * 60 * 24));
    return daysSinceStart * dayWidth;
  };

  // Calcule la largeur en pixels pour une tâche
  const getTaskWidth = (start, end) => {
    const duration = getDurationDays(start, end);
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 30;
    const dayWidth = 800 / totalDays;
    
    return Math.max(duration * dayWidth, 10); // Au moins 10px de large
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Option 1: Utiliser l'API pour récupérer les données depuis Notion
        // Décommentez cette section et commentez l'option 2 pour utiliser l'API
        /*
        const response = await fetch('/api/notion-csv');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const csvData = await response.text();
        */
        
        // Option 2: Utiliser un CSV intégré (pour notre démonstration)
        // Cela permet d'avoir un exemple fonctionnel même sans configuration de l'API Notion
        const csvData = `Nom,"Statut ",Date (OLD utiliser Dates),Temps vendus en jours,Responsable
Entretiens Stratégiques,Terminé,3 décembre 2024 → 20 décembre 2024,,Noé
Entretiens métiers,Terminé,6 janvier 2025 → 17 février 2025,,"Noé, Anaïs"
Ateliers co-construction,Terminé,13 février 2025 → 21 mars 2025,,"Noé, Anaïs"
Proof of Concept,En cours,19 mars 2025 → 11 avril 2025,,"Noé, Anaïs"
Note de cadrage,En cours,3 mars 2025 → 11 avril 2025,,
Specs fonctionnelles,,3 juillet 2025 → 27 août 2025,,
Entretien Marque,Terminé,15 janvier 2025 → 15 janvier 2025,,Anaïs
Entretien International,Terminé,16 janvier 2025 → 16 janvier 2025,,Anaïs
Dircom,Terminé,19 janvier 2025 → 19 janvier 2025,,Anaïs
Philanthropie,Terminé,20 janvier 2025 → 20 janvier 2025,,Anaïs
Dsi,Terminé,21 janvier 2025 → 21 janvier 2025,,Anaïs
Marque,Terminé,22 janvier 2025 → 22 janvier 2025,,Anaïs
Développement,Pas commencé,3 septembre 2025 → 29 octobre 2025,,
Recette,Pas commencé,1 novembre 2025 → 20 novembre 2025,,
Livraison finale,Pas commencé,22 novembre 2025 → 22 novembre 2025,,`;
        
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const processedTasks = processData(results.data);
            setTasks(processedTasks);
            
            if (processedTasks.length > 0) {
              const dates = processedTasks.flatMap(task => [task.startDate, task.endDate]);
              setMinDate(new Date(Math.min(...dates.map(d => d.getTime()))));
              setMaxDate(new Date(Math.max(...dates.map(d => d.getTime()))));
            }
            
            setLoading(false);
          },
          error: (error) => {
            setError('Erreur lors de l\'analyse du CSV: ' + error.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Erreur lors du chargement des données: ' + err.message);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Fonction pour générer les marqueurs de mois
  const generateMonthMarkers = () => {
    if (!minDate || !maxDate) return [];
    
    const result = [];
    const startDate = new Date(minDate);
    startDate.setDate(1); // Premier jour du mois
    
    const endDate = new Date(maxDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      result.push({
        date: new Date(currentDate),
        x: getPositionX(currentDate),
        label: currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      });
      
      // Passer au mois suivant
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return result;
  };

  if (loading) return <div className="p-4 text-center">Chargement des données...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (tasks.length === 0) return <div className="p-4">Aucune tâche avec des dates valides n'a été trouvée.</div>;

  // Grouper les tâches par phase
  const tasksByPhase = _.groupBy(tasks, 'phase');
  const phases = Object.keys(tasksByPhase);
  const monthMarkers = generateMonthMarkers();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Planning Pasteur - Diagramme de Gantt</h1>
      
      {/* Légende des statuts */}
      <div className="mb-4 flex flex-wrap gap-4">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1 rounded-full" 
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm">{status || 'Non défini'}</span>
          </div>
        ))}
      </div>
      
      {/* Statistiques */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Période</div>
            <div>{formatDate(minDate)} - {formatDate(maxDate)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Nombre de tâches</div>
            <div>{tasks.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tâches terminées</div>
            <div>{tasks.filter(t => t.status === 'Terminé').length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tâches en cours</div>
            <div>{tasks.filter(t => t.status === 'En cours').length}</div>
          </div>
        </div>
      </div>
      
      {/* Diagramme de Gantt */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '100%', width: '800px' }}>
          {/* Échelle de temps */}
          <div className="h-8 border-b relative">
            {monthMarkers.map((marker, idx) => (
              <div 
                key={idx} 
                className="absolute flex items-center h-full" 
                style={{ left: `${marker.x}px` }}
              >
                <div className="h-full w-px bg-gray-300"></div>
                <span className="ml-1 text-xs text-gray-500">{marker.label}</span>
              </div>
            ))}
          </div>
          
          {/* Tâches regroupées par phase */}
          <div className="mt-4">
            {phases.map(phase => (
              <div key={phase} className="mb-6">
                <h2 
                  className="text-lg font-bold mb-2 py-1 px-2 rounded" 
                  style={{ 
                    backgroundColor: `${phaseColors[phase]}20`, 
                    color: phaseColors[phase] 
                  }}
                >
                  {phase}
                </h2>
                
                {tasksByPhase[phase].map(task => (
                  <div 
                    key={task.id} 
                    className="relative h-8 mb-1 flex items-center"
                  >
                    {/* Nom de la tâche */}
                    <div className="absolute left-0 w-64 pr-4 truncate text-sm">
                      {task.name}
                    </div>
                    
                    {/* Barre de la tâche */}
                    <div 
                      className="absolute h-6 rounded-lg shadow-sm cursor-pointer"
                      style={{
                        left: `${getPositionX(task.startDate)}px`,
                        width: `${getTaskWidth(task.startDate, task.endDate)}px`,
                        backgroundColor: statusColors[task.status] || '#FFC107',
                        zIndex: 10
                      }}
                      title={`${task.name} (${formatDate(task.startDate)} - ${formatDate(task.endDate)})
Statut: ${task.status || 'Non défini'}
Responsable: ${task.responsible || 'Non défini'}
Durée: ${getDurationDays(task.startDate, task.endDate)} jours`}
                    >
                      <div className="px-2 text-xs text-white h-full flex items-center overflow-hidden whitespace-nowrap">
                        {getTaskWidth(task.startDate, task.endDate) > 60 ? (
                          task.name
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;