import React, { useEffect, useRef, useState } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Button from '@mui/material/Button';
import FamilyMap from '../components/FamilyMap';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';

// Modal :
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { current } from '@reduxjs/toolkit';

const elk = new ELK();

// Add this at the top of your component (outside the FamilyTree function)
const generateNodeId = (userId, name = '') => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const nameSlug = name.toLowerCase().replace(/\s+/g, '_').substring(0, 20);
    return `user_${userId}_${timestamp}_${randomSuffix}_${nameSlug}`;
};

const CustomNode = ({ data }) => {
    const parents = data.parents || [];
    const children = data.children || [];
    return (
        <div className="p-2 border rounded-lg shadow bg-green-100 min-w-[150px] relative">
            {data.photo && (
                <img
                    src={data.photo}
                    alt={`${data.label}'s photo`}
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                />
            )}
            <strong>{data.label}</strong>
            <p className="text-xs text-gray-700">{data.relation}</p>
            <p className="text-xs text-gray-500">{data.birthdate}</p>
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
                {parents.map((p, i) => (
                    <Handle
                        key={`parent-${i}`}
                        type="target"
                        position={Position.Top}
                        id={`parent-${i}`}
                        style={{ top: 10 + i * 15, background: '#555' }}
                    />
                ))}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
                {children.map((c, i) => (
                    <Handle
                        key={`child-${i}`}
                        type="source"
                        position={Position.Bottom}
                        id={`child-${i}`}
                        style={{ bottom: 10 + i * 15, background: '#555' }}
                    />
                ))}
            </div>
        </div>
    );
};


// Modal :
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};



const nodeTypes = { custom: CustomNode };

export default function FamilyTree() {
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [childName, setChildName] = useState('');
    const [parentName, setParentName] = useState('');
    const [location, setLocation] = useState('');
    const [relation, setRelation] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const reactFlowWrapper = useRef(null);
    const [userId, setUserId] = useState('')
    const [selectedNode, setSelectedNode] = useState(null);

    const [photo, setPhoto] = useState(null);

    // Modal:
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);




    const [upcoming, setUpcoming] = useState([]);
    const [notifiedBdays, setNotifiedBdays] = useState(() => {
        const storedBirthdays = localStorage.getItem('notifiedBdays');
        return storedBirthdays ? JSON.parse(storedBirthdays) : [];
    })

    const currentUser = useSelector((state) => state.user.currentUser);

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded shadow text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
                    <p className="text-gray-600">You need to be signed in to view your family tree.</p>
                </div>
            </div>
        );
    }


    const handleUpdateMember = async (e) => {
        e.preventDefault();
        console.log(selectedNode.id);
        // Update the node with recalculated parents/children
        const updated = nodes.map((n) =>
            n.id === selectedNode.id
                ? {
                    ...n,
                    data: {
                        ...n.data,
                        label: selectedNode.data.label,
                        relation: selectedNode.data.relation,
                        birthdate: selectedNode.data.birthdate,
                        location: selectedNode.data.location,
                        photo: selectedNode.data.photo,
                        parents: edges.filter(e => e.target === n.id).map(e => e.source),
                        children: edges.filter(e => e.source === n.id).map(e => e.target),
                    },
                }
                : n
        );

        setNodes(updated);
        await layoutGraph(updated, edges);

        // Get the updated node data to send
        const updatedNode = updated.find(n => n.id === selectedNode.id);
        console.log(updatedNode.id);

        try {
            await fetch('https://famtree-1.onrender.com/api/update-family-member', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nodeId: updatedNode.id,
                    name: updatedNode.data.label,
                    relation: updatedNode.data.relation,
                    birthdate: updatedNode.data.birthdate,
                    photo: updatedNode.data.photo,
                    location: updatedNode.data.location,
                }),
                credentials: 'include'
            });
        } catch (err) {
            console.error('Update failed:', err);
        }

        // Clear selection after the update
        setSelectedNode(null);
    };



    const userEmail = currentUser?.email;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`https://famtree-1.onrender.com/api/fetchUser/${userEmail}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await res.json();

                if (res.ok) {
                    setUserId(data.id);
                }
            } catch (error) {
                console.error("Fetch failed:", error);
            }
        };

        if (userEmail) {
            fetchUser();
        }
    }, [userEmail]);


    // Function to run Elk layout
    const layoutGraph = async (nodes, edges) => {
        // Build Elk graph format
        const elkGraph = {
            id: 'root',
            layoutOptions: {
                'elk.algorithm': 'layered',
                'elk.direction': 'DOWN',
                'elk.spacing.nodeNode': '30',
            },
            children: nodes.map((node) => ({
                id: node.id,
                width: 180,
                height: 80,
            })),
            edges: edges.map((edge) => ({
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target],
            })),
        };

        try {
            const elkResult = await elk.layout(elkGraph);

            // Map elk positions to nodes
            const laidOutNodes = nodes.map((node) => {
                const elkNode = elkResult.children.find((n) => n.id === node.id);
                return {
                    ...node,
                    position: {
                        x: elkNode.x,
                        y: elkNode.y,
                    },
                    // Pass parents and children for handles
                    data: {
                        label: node.data.label,
                        relation: node.data.relation,
                        birthdate: node.data.birthdate,
                        photo: node.data.photo,
                        location: node.data.location,
                        parents: edges
                            .filter((e) => e.target === node.id)
                            .map((e) => e.source),
                        children: edges
                            .filter((e) => e.source === node.id)
                            .map((e) => e.target),
                    }

                };
            });

            setNodes(laidOutNodes);
            return laidOutNodes; // Return the laid out nodes
        } catch (error) {
            console.error('ELK layout error:', error);
            return nodes;
        }
    };

    // Add member handler, simplified to update nodes/edges and run Elk layout
    const handleAddMember = async (e) => {
        e.preventDefault();
        const newNodeId = generateNodeId(userId, childName);
        const newNode = {
            id: newNodeId,
            type: 'custom',
            data: {
                label: childName,
                relation,
                birthdate,
                location,
                photo,
                parents: [],
                children: []
            },
            position: { x: 0, y: 0 },
        };

        // First add the new node
        const updatedNodes = [...nodes, newNode];

        // Then calculate new edges
        const updatedEdges = [...edges];
        const parentNames = parentName.split(',').map(name => name.trim().toLowerCase());

        parentNames.forEach((pName) => {
            const parentNode = updatedNodes.find(n =>
                n.data.label.toLowerCase() === pName
            );
            if (parentNode) {
                const edgeId = `${parentNode.id}-${newNodeId}`;
                if (!updatedEdges.some(e => e.id === edgeId)) {
                    updatedEdges.push({
                        id: edgeId,
                        source: parentNode.id,
                        target: newNodeId
                    });
                }
            }
        });

        
        setEdges(updatedEdges);

        try {
            const formData = new FormData();
            formData.append('newNodeId', newNodeId);
            formData.append('name', childName);
            formData.append('relation', relation);
            formData.append('birthdate', birthdate);
            formData.append('parentName', parentName);
            formData.append('location', location);
            formData.append('created_by', userId);
            if (photo) {
                formData.append('photo', photo);
            }

            const response = await fetch('https://famtree-1.onrender.com/api/add-family-tree', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            let finalNodes = updatedNodes;
            if (response.ok) {
                const result = await response.json();
                finalNodes = updatedNodes.map(n =>
                    n.id === newNodeId
                        ? { ...n, data: { ...n.data, photo: result.photoUrl } }
                        : n
                );
            }

            // setEdges(updatedEdges);
            const laidOutNodes = await layoutGraph(finalNodes, updatedEdges);
            setNodes(laidOutNodes);

            // setUpcoming(getUpcomingBirthdays(laidOutNodes));

        } catch (err) {
            console.error('Error adding node:', err);
        }

        // Reset form fields
        setChildName('');
        setParentName('');
        setRelation('');
        setBirthdate('');
        setLocation('');
        setPhoto(null);
    };
    // Fetch tree and run layout on mount
    // useEffect(() => {
    //     const fetchTree = async () => {
    //         try {
    //             const res = await fetch(`https://famtree-1.onrender.com/api/family-tree/${userId}`);
    //             const data = await res.json();

    //             if (Array.isArray(data)) {
    //                 const nodesTemp = [];
    //                 const edgesTemp = [];
    //                 const nameToId = new Map();

    //                 const traverse = (node, parentId = null) => {
    //                     if (nameToId.has(node.name)) {
    //                         const nodeId = node.nodeId;
    //                     } else {
    //                         const nodeId = node.nodeId;
    //                         nameToId.set(node.name, nodeId);

    //                         const attrs = node.attributes || {};
    //                         const relation = attrs.relation || node.relation || '';
    //                         const birthdate = (attrs.birthdate || node.birthdate || '').split('T')[0];
    //                         const location = attrs.location || node.location || '';
    //                         const photo = attrs.photoUrl || '';

    //                         nodesTemp.push({
    //                             id: nodeId,
    //                             type: 'custom',
    //                             data: {
    //                                 label: node.name,
    //                                 relation,
    //                                 birthdate,
    //                                 location,
    //                                 photo,
    //                                 parents: [],
    //                                 children: [],
    //                             },
    //                             position: { x: 0, y: 0 },
    //                         });
    //                     }

    //                     if (parentId && parentId !== node.nodeId) {
    //                         const edgeId = `${parentId}-${node.nodeId}`;
    //                         if (!edgesTemp.find((e) => e.id === edgeId)) {
    //                             edgesTemp.push({ id: edgeId, source: parentId, target: node.nodeId });
    //                         }
    //                     }

    //                     if (node.children) {
    //                         node.children.forEach((child) => traverse(child, node.nodeId));
    //                     }
    //                 };


    //                 data.forEach((d) => traverse(d));

    //                 await layoutGraph(nodesTemp, edgesTemp);
    //                 setEdges(edgesTemp);
    //                 setUpcoming(getUpcomingBirthdays(nodesTemp));
    //             }
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     };

    //     fetchTree();
    // }, [userId]);


    // // useEffect(() => {
    // const getUpcomingBirthdays = (nodeList) => {
    //     const today = new Date();
    //     const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    //     const upcoming = [];

    //     nodeList.forEach((node) => {
    //         const date = node.data?.birthdate;
    //         if (date) {
    //             const [year, month, day] = date.split('-').map(Number);
    //             const birthday = new Date();
    //             birthday.setFullYear(today.getFullYear(), month - 1, day);
    //             const birthdayStr = birthday.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    //             const diff = Math.ceil(
    //                 (new Date(birthdayStr) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
    //             );

    //             if (diff >= 0 && diff <= 7) {
    //                 upcoming.push({
    //                     name: node.data.label,
    //                     date,
    //                     inDays: diff,
    //                     email: node.data.email, // optional
    //                     id: node.data.newNodeId,
    //                 });
    //             }
    //         }
    //     });

    //     return upcoming.sort((a, b) => a.inDays - b.inDays);
    // };

    // useEffect(() => {
    //     const upcomingBirthdays = getUpcomingBirthdays(nodes);
    //     setUpcoming(upcomingBirthdays);
    // }, [nodes]);


    // useEffect(() => {
    //     const bdayNotifEmail = currentUser.email;
    //     // Only send notification if there are birthdays and we haven't notified yet
    //     if (upcoming.length > 0) {
    //         const uniqueBirthdays = upcoming.filter(b => { !notifiedBdays.includes(b.id) });
    //         if (uniqueBirthdays.length > 0) {
    //             fetch('https://famtree-1.onrender.com/api/bday-notification-email', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     birthdays: uniqueBirthdays,
    //                     email: bdayNotifEmail
    //                 }),
    //             }).then(() => {
    //                 // Update notified birthdays in state and local storage
    //                 const newNotified = [...notifiedBdays, ...uniqueBirthdays.map(b => b.id)];
    //                 setNotifiedBdays(newNotified);
    //                 localStorage.setItem('notifiedBdays', JSON.stringify(newNotified));
    //             }).catch((error) => console.error('Notification failed', error));
    //         }
    //     }
    // }, [upcoming, currentUser, notifiedBdays]);





    useEffect(() => {
        const fetchTreeAndNotify = async () => {
            try {
                // 1. Fetch family tree data
                const res = await fetch(`https://famtree-1.onrender.com/api/family-tree/${userId}`, {
                    method: 'GET'
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    const nodesTemp = [];
                    const edgesTemp = [];
                    const nameToId = new Map();

                    // Tree traversal function
                    const traverse = (node, parentId = null) => {
                        if (nameToId.has(node.name)) {
                            const nodeId = node.nodeId;
                        } else {
                            const nodeId = node.nodeId;
                            nameToId.set(node.name, nodeId);

                            const attrs = node.attributes || {};
                            const relation = attrs.relation || node.relation || '';
                            const birthdate = (attrs.birthdate || node.birthdate || '').split('T')[0];
                            const location = attrs.location || node.location || '';
                            const photo = attrs.photoUrl || '';
                            const email = attrs.email || '';

                            nodesTemp.push({
                                id: nodeId,
                                type: 'custom',
                                data: {
                                    label: node.name,
                                    relation,
                                    birthdate,
                                    location,
                                    photo,
                                    email,
                                    parents: [],
                                    children: [],
                                    newNodeId: nodeId, // Ensure unique ID for notifications
                                },
                                position: { x: 0, y: 0 },
                            });
                        }

                        if (parentId && parentId !== node.nodeId) {
                            const edgeId = `${parentId}-${node.nodeId}`;
                            if (!edgesTemp.find((e) => e.id === edgeId)) {
                                edgesTemp.push({ id: edgeId, source: parentId, target: node.nodeId });
                            }
                        }

                        if (node.children) {
                            node.children.forEach((child) => traverse(child, node.nodeId));
                        }
                    };

                    data.forEach((d) => traverse(d));
                    await layoutGraph(nodesTemp, edgesTemp);
                    setEdges(edgesTemp);

                    // 2. Process upcoming birthdays
                    const today = new Date();
                    const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                    const upcoming = [];

                    nodesTemp.forEach((node) => {
                        const date = node.data?.birthdate;
                        if (date) {
                            const [year, month, day] = date.split('-').map(Number);
                            const birthday = new Date();
                            birthday.setFullYear(today.getFullYear(), month - 1, day);
                            const birthdayStr = birthday.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

                            const diff = Math.ceil(
                                (new Date(birthdayStr) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
                            );

                            if (diff >= 0 && diff <= 7) {
                                upcoming.push({
                                    name: node.data.label,
                                    date,
                                    inDays: diff,
                                    email: node.data.email,
                                    id: node.data.newNodeId,
                                });
                            }
                        }
                    });

                    const sortedUpcoming = upcoming.sort((a, b) => a.inDays - b.inDays);
                    setUpcoming(sortedUpcoming);

                    // 3. Send notifications if needed
                    if (sortedUpcoming.length > 0) {
                        const savedNotifications = JSON.parse(localStorage.getItem('notifiedBdays') || []);
                        const uniqueBirthdays = sortedUpcoming.filter(b => !savedNotifications.includes(b.id));

                        if (uniqueBirthdays.length > 0) {
                            try {
                                await fetch('https://famtree-1.onrender.com/api/bday-notification-email', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        birthdays: uniqueBirthdays,
                                        email: currentUser.email
                                    }),
                                    credentials: 'include'
                                });

                                // Update notifications in state and localStorage
                                const newNotified = [...savedNotifications, ...uniqueBirthdays.map(b => b.id)];
                                localStorage.setItem('notifiedBdays', JSON.stringify(newNotified));
                            } catch (error) {
                                console.error('Notification failed', error);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching tree or sending notifications:', err);
            } finally {
                setLoading(false); // Step 3: Update loading state
            }
        };

        fetchTreeAndNotify();
    }, [userId, currentUser?.email]); // Only re-run when userId or email changes

    if (loading) {
        // Step 2: Display loading indicator
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <CircularProgress /> {/* Loading spinner */}
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 bg-gray-50">
            {/* Birthdays Section */}
            <div className="m-6 max-w-md mx-auto bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-blue-700 font-semibold mb-2">🎉 Upcoming Birthdays</h3>
                {upcoming.length === 0 ? (
                    <p className="text-gray-500">No birthdays in the next 7 days.</p>
                ) : (
                    <ul className="space-y-1">
                        {upcoming.map((b, i) => (
                            <li key={i} className="text-sm">
                                <strong>{b.name}</strong>: {b.date} ({b.inDays} day{b.inDays !== 1 ? 's' : ''} left)
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <form
                onSubmit={handleAddMember}
                className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mb-10"
            >
                <h2 className="text-xl font-semibold text-center text-gray-800">Add Family Member</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    required
                    className="w-full border p-2 rounded"
                />
{/*                 <input
                    type="text"
                    placeholder="Relation"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    required
                    className="w-full border p-2 rounded"
                /> */}
                <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    required
                    className="w-full border p-2 rounded"
                >
                    <option value="" disabled>Select Relation</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="spouse">Spouse</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="uncle">Uncle</option>
                    <option value="aunt">Aunt</option>
                    <option value="cousin">Cousin</option>
                    <option value="self">Self</option> {/* Added 'self' option */}
                </select>
                <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    placeholder="Parent Name(s) (comma separated)"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    placeholder="Location (e.g., New York, USA)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border p-2 rounded"
                />


                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])} // Store the selected file
                    className="w-full border p-2 rounded"
                />

                <div className="text-center">
                    <Button type="submit" variant="contained">
                        Add Member
                    </Button>
                </div>
            </form>

            {/* Flow Diagram */}
            <div
                ref={reactFlowWrapper}
                style={{ width: '100%', height: '70vh' }}
                className="border rounded-lg bg-white"
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onNodeClick={(event, node) => { setSelectedNode(node), handleOpen() }}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>

            <div className="rounded-lg pt-5">
                <FamilyMap members={nodes} />
            </div>

            {selectedNode && (
                <div>
                    <Button onClick={handleOpen}>Open modal</Button>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <form
                                    onSubmit={(e) => {
                                        handleUpdateMember(e);
                                        handleClose();
                                    }}
                                    className="w-full max-w-xl bg-lime-100 p-6 rounded-xl shadow-lg space-y-6 border border-lime-300"
                                >
                                    <h2 className="text-xl font-semibold text-center text-lime-800">Update Family Member</h2>

                                    <input
                                        type="text"
                                        value={selectedNode.data.label}
                                        onChange={(e) =>
                                            setSelectedNode((prev) => ({
                                                ...prev,
                                                data: { ...prev.data, label: e.target.value }
                                            }))
                                        }
                                        className="w-full border p-2 rounded"
                                    />

                                    <input
                                        type="text"
                                        value={selectedNode.data.relation}
                                        onChange={(e) =>
                                            setSelectedNode((prev) => ({
                                                ...prev,
                                                data: { ...prev.data, relation: e.target.value }
                                            }))
                                        }
                                        className="w-full border p-2 rounded"
                                    />

                                    <input
                                        type="date"
                                        value={selectedNode.data.birthdate}
                                        onChange={(e) =>
                                            setSelectedNode((prev) => ({
                                                ...prev,
                                                data: { ...prev.data, birthdate: e.target.value }
                                            }))
                                        }
                                        className="w-full border p-2 rounded"
                                    />

                                    <input
                                        type="text"
                                        value={selectedNode.data.location}
                                        onChange={(e) =>
                                            setSelectedNode((prev) => ({
                                                ...prev,
                                                data: { ...prev.data, location: e.target.value }
                                            }))
                                        }
                                        className="w-full border p-2 rounded"
                                    />

                                    <div className="text-center">
                                        <Button type="submit" variant="contained" color="Success">
                                            Update Member
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Box>
                    </Modal>
                </div>
            )}
        </div>
    );
}
