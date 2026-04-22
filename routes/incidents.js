const express = require('express');
const router = express.Router();
const { getFirestore, collection, addDoc, 
        getDocs, doc, updateDoc, getDoc, 
        orderBy, query } = require("firebase/firestore");
const db = require('../firebase.js');

router.post('/sos', async (req, res) => {
    try {
        const { triggeredBy, type, location } = req.body;
        const newIncident = {
            triggeredBy,
            type,
            location,
            status: "active",
            timestamp: new Date()
        };
        const docRef = await addDoc(collection(db, 'incidents'), newIncident);
        res.status(201).json({ id: docRef.id, ...newIncident });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/incidents', async (req, res) => {
    try {
        const q = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const incidents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(incidents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/incidents/:id/acknowledge', async (req, res) => {
    try {
        const { id } = req.params;
        const { acknowledgedBy } = req.body;
        await updateDoc(doc(db, 'incidents', id), {
            status: "acknowledged",
            acknowledgedBy: acknowledgedBy
        });
        res.status(200).json({ message: "Incident acknowledged" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/incidents/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = doc(db, 'incidents', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return res.status(404).json({ error: "Incident not found" });
        }
        const data = docSnap.data();
        const startTime = data.timestamp.toDate ? 
              data.timestamp.toDate() : new Date(data.timestamp);
        const responseTime = (Date.now() - startTime.getTime()) / 1000;
        await updateDoc(docRef, {
            status: "resolved",
            responseTime: responseTime
        });
        res.status(200).json({ 
            message: "Incident resolved", 
            responseTime: `${responseTime} seconds` 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;