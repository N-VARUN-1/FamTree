import db from '../db.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const addNode = async (req, res) => {
    const { newNodeId, name, relation, birthdate, parentName, created_by, location } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Check for existing nodeId
        const [existing] = await db.query('SELECT id FROM person WHERE nodeId = ?', [newNodeId]);
        if (existing.length) {
            return res.status(400).json({ message: 'Node with this ID already exists' });
        }

        // Insert the new person
        const [result] = await db.query(
            'INSERT INTO person (nodeId, name, relation, birthdate, created_by, location, photoUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newNodeId, name, relation, birthdate, created_by, location, photoUrl]
        );

        const newPersonId = result.insertId;

        if (parentName) {
            const parentNames = parentName
                .split(',')
                .map((n) => n.trim())
                .filter((n) => n.length > 0);

            for (const pName of parentNames) {
                const [parent] = await db.query('SELECT id FROM person WHERE name = ?', [pName]);

                if (!parent.length) {
                    console.warn(`Parent "${pName}" not found. Skipping.`);
                    continue;
                }

                const parentId = parent[0].id;

                // Add bidirectional relationship
                await db.query(
                    'INSERT INTO relationships (from_person_id, to_person_id, relationship_type) VALUES (?, ?, ?)',
                    [newPersonId, parentId, 'child']
                );

                await db.query(
                    'INSERT INTO relationships (from_person_id, to_person_id, relationship_type) VALUES (?, ?, ?)',
                    [parentId, newPersonId, 'parent']
                );
            }
        } else {
            // No parent: link to self
            await db.query(
                'INSERT INTO relationships (from_person_id, to_person_id, relationship_type) VALUES (?, ?, ?)',
                [newPersonId, newPersonId, 'self']
            );
        }

        res.status(201).json({ message: 'Person and relationships added', photoUrl });

    } catch (error) {
        console.error('Add Node Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// Get family tree
export const getFamilyTree = async (req, res) => {
    const userId = req.params.userId;
    try {
        const [people] = await db.query('SELECT * FROM person WHERE created_by = ?', [userId]);

        const relationQuery = `
            SELECT p1.name AS parent_name, p2.name AS child_name 
            FROM relationships r 
            JOIN person p1 ON r.from_person_id = p1.id 
            JOIN person p2 ON r.to_person_id = p2.id 
            WHERE r.relationship_type = 'parent'
        `;
        const [relationships] = await db.query(relationQuery);

        const personMap = {};
        people.forEach((person) => {
            personMap[person.name] = {
                nodeId: person.nodeId,
                name: person.name,
                relation: person.relation,
                attributes: {
                    birthdate: person.birthdate,
                    location: person.location,
                },
                children: [],
            };
        });

        const childrenSet = new Set();

        relationships.forEach(({ parent_name, child_name }) => {
            const parent = personMap[parent_name];
            const child = personMap[child_name];
            if (parent && child) {
                parent.children.push(child);
                childrenSet.add(child_name);
            }
        });

        const treeRoots = people
            .filter(person => !childrenSet.has(person.name))
            .map(person => personMap[person.name]);

        res.status(200).json(treeRoots);
    } catch (error) {
        console.error('Error building family tree:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateFamilyTree = async (req, res) => {
    const { nodeId, name, relation, birthdate, location } = req.body;

    if (!nodeId) return res.status(400).json({ error: 'Node ID is required' });

    try {
        const query = `
            UPDATE person
            SET name = ?, relation = ?, birthdate = ?, location = ?
            WHERE nodeId = ?
        `;
        const values = [name, relation, birthdate, location, nodeId];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Update Error:', err);
                return res.status(500).json({ error: 'Failed to update member' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Member not found' });
            }

            res.status(200).json({ message: 'Member updated successfully' });
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};





export const bdayNotification = async (req, res) => {
    const { birthdays, email } = req.body;
    if (!birthdays || birthdays.length === 0) {
        return res.status(400).json({ message: 'No Upcoming Birthdays' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASS,
            },
        });

        for (const person of birthdays) {
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: email,
                subject: `🎉 Upcoming Birthday: ${person.name}`,
                html: `
          <h3>Hi ${person.name}!</h3>
          <p>We noticed your birthday is coming up in <strong>${person.inDays}</strong> day(s)!</p>
          <p>Have a wonderful day ahead 🎂</p>
          <br />
          <small>This is an automated birthday notification.</small>
        `,
            };

            await transporter.sendMail(mailOptions);
        }

        res.status(200).json({ message: 'Birthday notifications sent' });
    } catch (error) {
        console.error('Error sending birthday notifications:', error.message);
        res.status(500).json({ message: 'Error sending notifications' });
    }
}
