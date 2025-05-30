// import React, { useEffect, useRef, useState } from 'react';
// import ReactFlow, {
//     addEdge,
//     Background,
//     Controls,
//     MiniMap,
//     useNodesState,
//     useEdgesState,
//     Handle,
//     Position,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import Button from '@mui/material/Button';
// import FamilyMap from '../components/FamilyMap';
// import ELK from 'elkjs/lib/elk.bundled.js';
// import { useSelector } from 'react-redux';

// // Modal :
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import Modal from '@mui/material/Modal';

// const elk = new ELK();

// // let id = 0;
// // const getId = () => `node_${id++}`;

// let id = 0;
// const getId = (userId) => `${userId}_node_${id++}`;


// // Custom node with multiple handles for parents and children
// const CustomNode = ({ data }) => {
//     const parents = data.parents || [];  // Array of parent names/ids
//     const children = data.children || []; // Array of children names/ids

//     return (
//         <div className="p-2 border rounded-lg shadow bg-green-100 min-w-[150px] relative">
//             <strong>{data.label}</strong>
//             <p className="text-xs text-gray-700">{data.relation}</p>
//             <p className="text-xs text-gray-500">{data.birthdate}</p>
//             <div style={{ position: 'absolute', top: 0, left: 0 }}>
//                 {parents.map((p, i) => (
//                     <Handle
//                         key={`parent-${i}`}
//                         type="target"
//                         position={Position.Top}
//                         id={`parent-${i}`}
//                         style={{ top: 10 + i * 15, background: '#555' }}
//                     />
//                 ))}
//             </div>
//             <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
//                 {children.map((c, i) => (
//                     <Handle
//                         key={`child-${i}`}
//                         type="source"
//                         position={Position.Bottom}
//                         id={`child-${i}`}
//                         style={{ bottom: 10 + i * 15, background: '#555' }}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };


// // Modal :
// const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 400,
//     bgcolor: 'background.paper',
//     border: '2px solid #000',
//     boxShadow: 24,
//     p: 4,
// };



// const nodeTypes = { custom: CustomNode };

// export default function FamilyTree() {
//     const [nodes, setNodes, onNodesChange] = useNodesState([]);
//     const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//     const [childName, setChildName] = useState('');
//     const [parentName, setParentName] = useState('');
//     const [location, setLocation] = useState('');
//     const [relation, setRelation] = useState('');
//     const [birthdate, setBirthdate] = useState('');
//     const reactFlowWrapper = useRef(null);
//     const [userId, setUserId] = useState('')
//     const [selectedNode, setSelectedNode] = useState(null);
//     const [upcomingBday, setUpcomingBday] = useState([]);

//     // Modal:
//     const [open, setOpen] = React.useState(false);
//     const handleOpen = () => setOpen(true);
//     const handleClose = () => setOpen(false);




//     const [upcoming, setUpcoming] = useState([]);

//     const currentUser = useSelector((state) => state.user.currentUser);

//     if (!currentUser) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-100">
//                 <div className="bg-white p-6 rounded shadow text-center">
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
//                     <p className="text-gray-600">You need to be signed in to view your family tree.</p>
//                 </div>
//             </div>
//         );
//     }


//     const handleUpdateMember = async (e) => {
//         e.preventDefault();

//         // Update the node with recalculated parents/children
//         const updated = nodes.map((n) =>
//             n.id === selectedNode.id
//                 ? {
//                     ...n,
//                     data: {
//                         ...selectedNode.data,
//                         parents: edges.filter(e => e.target === n.id).map(e => e.source),
//                         children: edges.filter(e => e.source === n.id).map(e => e.target),
//                     },
//                 }
//                 : n
//         );

//         setNodes(updated);
//         layoutGraph(updated, edges);

//         // Get the updated node data to send
//         const updatedNode = updated.find(n => n.id === selectedNode.id);

//         try {
//             await fetch('http://localhost:3000/api/update-family-member', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     nodeId: updatedNode.id,
//                     name: updatedNode.data.label,
//                     relation: updatedNode.data.relation,
//                     birthdate: updatedNode.data.birthdate,
//                     location: updatedNode.data.location,
//                 }),
//             });
//         } catch (err) {
//             console.error('Update failed:', err);
//         }

//         // Clear selection after the update
//         setSelectedNode(null);
//     };



//     const userEmail = currentUser?.email;

//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const res = await fetch(`http://localhost:3000/api/fetchUser/${userEmail}`, {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     }
//                 });

//                 const data = await res.json();

//                 if (res.ok) {
//                     setUserId(data.id);
//                 }
//             } catch (error) {
//                 console.error("Fetch failed:", error);
//             }
//         };

//         if (userEmail) {
//             fetchUser();
//         }
//     }, [userEmail]);


//     // Function to run Elk layout
//     const layoutGraph = async (nodes, edges) => {
//         // Build Elk graph format
//         const elkGraph = {
//             id: 'root',
//             layoutOptions: {
//                 'elk.algorithm': 'layered',
//                 'elk.direction': 'DOWN',
//                 'elk.spacing.nodeNode': '30',
//             },
//             children: nodes.map((node) => ({
//                 id: node.id,
//                 width: 180,
//                 height: 80,
//             })),
//             edges: edges.map((edge) => ({
//                 id: edge.id,
//                 sources: [edge.source],
//                 targets: [edge.target],
//             })),
//         };

//         try {
//             const elkResult = await elk.layout(elkGraph);

//             // Map elk positions to nodes
//             const laidOutNodes = nodes.map((node) => {
//                 const elkNode = elkResult.children.find((n) => n.id === node.id);
//                 return {
//                     ...node,
//                     position: {
//                         x: elkNode.x,
//                         y: elkNode.y,
//                     },
//                     // Pass parents and children for handles
//                     data: {
//                         label: node.data.label,
//                         relation: node.data.relation,
//                         birthdate: node.data.birthdate,
//                         location: node.data.location,
//                         parents: edges
//                             .filter((e) => e.target === node.id)
//                             .map((e) => e.source),
//                         children: edges
//                             .filter((e) => e.source === node.id)
//                             .map((e) => e.target),
//                     }

//                 };
//             });

//             setNodes(laidOutNodes);
//         } catch (error) {
//             console.error('ELK layout error:', error);
//         }
//     };

//     // Add member handler, simplified to update nodes/edges and run Elk layout
//     const handleAddMember = async (e) => {
//         e.preventDefault();

//         const newNodeId = getId(userId);
//         const newNode = {
//             id: newNodeId,
//             type: 'custom',
//             data: { label: childName, relation, birthdate, location, parents: [], children: [] },
//             position: { x: 0, y: 0 }, // will be set by layout
//         };

//         // Add new node and edges based on parents
//         setNodes((nds) => {
//             const updatedNodes = [...nds, newNode];

//             setEdges((eds) => {
//                 const updatedEdges = [...eds];
//                 const parentNames = parentName
//                     .split(',')
//                     .map((name) => name.trim().toLowerCase());

//                 parentNames.forEach((pName) => {
//                     const parentNode = updatedNodes.find(
//                         (n) => n.data.label.toLowerCase() === pName
//                     );

//                     if (parentNode) {
//                         const edgeId = `${parentNode.id}-${newNodeId}`;
//                         if (!updatedEdges.some((e) => e.id === edgeId)) {
//                             updatedEdges.push({
//                                 id: edgeId,
//                                 source: parentNode.id,
//                                 target: newNodeId,
//                             });
//                         }
//                     }
//                 });

//                 // After edges updated, run layout again
//                 layoutGraph(updatedNodes, updatedEdges);

//                 return updatedEdges;
//             });

//             return updatedNodes;
//         });
//         // Save to backend (optional)
//         try {
//             await fetch('http://localhost:3000/api/add-family-tree', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     newNodeId,
//                     name: childName,
//                     relation,
//                     birthdate,
//                     parentName,
//                     location,
//                     created_by: userId,
//                 }),
//             });
//         } catch (err) {
//             console.error('Error adding node:', err);
//         }
//     };
//     // Fetch tree and run layout on mount
//     useEffect(() => {
//         const fetchTree = async () => {
//             try {
//                 const res = await fetch(`http://localhost:3000/api/family-tree/${userId}`);
//                 const data = await res.json();

//                 if (Array.isArray(data)) {
//                     const nodesTemp = [];
//                     const edgesTemp = [];
//                     const nameToId = new Map();

//                     const traverse = (node, parentId = null) => {
//                         let nodeId;
//                         if (nameToId.has(node.name)) {
//                             nodeId = nameToId.get(node.name);
//                         } else {
//                             nodeId = getId(userId);
//                             nameToId.set(node.name, nodeId);

//                             const attrs = node.attributes || {};
//                             const relation = attrs.relation || node.relation || '';
//                             const birthdate = (attrs.birthdate || node.birthdate || '').split('T')[0];
//                             const location = attrs.location || node.location || '';

//                             nodesTemp.push({
//                                 id: nodeId,
//                                 type: 'custom',
//                                 data: {
//                                     label: node.name,
//                                     relation,
//                                     birthdate,
//                                     location,
//                                     parents: [],
//                                     children: [],
//                                 },
//                                 position: { x: 0, y: 0 },
//                             });
//                         }

//                         if (parentId && parentId !== nodeId) {
//                             const edgeId = `${parentId}-${nodeId}`;
//                             if (!edgesTemp.find((e) => e.id === edgeId)) {
//                                 edgesTemp.push({ id: edgeId, source: parentId, target: nodeId });
//                             }
//                         }

//                         if (node.children) {
//                             node.children.forEach((child) => traverse(child, nodeId));
//                         }
//                     };


//                     data.forEach((d) => traverse(d));

//                     // Run elk layout before setting nodes and edges
//                     await layoutGraph(nodesTemp, edgesTemp);
//                     setEdges(edgesTemp);
//                     setUpcoming(getUpcomingBirthdays(nodesTemp));
//                 }
//             } catch (err) {
//                 console.error(err);
//             }
//         };

//         fetchTree();
//     }, [userId]);


//     useEffect(() => {
//         const getUpcomingBirthdays = (nodeList) => {
//             const today = new Date();
//             const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

//             const upcoming = [];

//             nodeList.forEach((node) => {
//                 const date = node.data?.birthdate;
//                 if (date) {
//                     const [year, month, day] = date.split('-').map(Number);
//                     const birthday = new Date();
//                     birthday.setFullYear(today.getFullYear(), month - 1, day);
//                     const birthdayStr = birthday.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

//                     const diff = Math.ceil(
//                         (new Date(birthdayStr) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
//                     );

//                     if (diff >= 0 && diff <= 7) {
//                         upcoming.push({
//                             name: node.data.label,
//                             date,
//                             inDays: diff,
//                             email: node.data.email, // optional
//                         });
//                     }
//                 }
//             });

//             return upcoming.sort((a, b) => a.inDays - b.inDays);
//         };

//         const upcomingBirthdays = getUpcomingBirthdays(nodes); // ✅ fixed here
//         setUpcoming(upcomingBirthdays);

//         // Notify backend
//         if (upcomingBirthdays.length > 0) {
//             fetch('/api/notify-birthdays', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ birthdays: upcomingBirthdays }),
//             }).catch((err) => console.error('Notification failed', err));
//         }
//     }, [nodes]); // ✅ run this whenever nodes change



//     return (
//         <div className="min-h-screen p-4 bg-gray-50">
//             {/* Birthdays Section */}
//             <div className="m-6 max-w-md mx-auto bg-blue-50 border border-blue-200 p-4 rounded-lg">
//                 <h3 className="text-blue-700 font-semibold mb-2">🎉 Upcoming Birthdays</h3>
//                 {upcoming.length === 0 ? (
//                     <p className="text-gray-500">No birthdays in the next 7 days.</p>
//                 ) : (
//                     <ul className="space-y-1">
//                         {upcoming.map((b, i) => (
//                             <li key={i} className="text-sm">
//                                 <strong>{b.name}</strong>: {b.date} ({b.inDays} day{b.inDays !== 1 ? 's' : ''} left)
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>

//             <form
//                 onSubmit={handleAddMember}
//                 className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mb-10"
//             >
//                 <h2 className="text-xl font-semibold text-center text-gray-800">Add Family Member</h2>
//                 <input
//                     type="text"
//                     placeholder="Name"
//                     value={childName}
//                     onChange={(e) => setChildName(e.target.value)}
//                     required
//                     className="w-full border p-2 rounded"
//                 />
//                 <input
//                     type="text"
//                     placeholder="Relation"
//                     value={relation}
//                     onChange={(e) => setRelation(e.target.value)}
//                     required
//                     className="w-full border p-2 rounded"
//                 />
//                 <input
//                     type="date"
//                     value={birthdate}
//                     onChange={(e) => setBirthdate(e.target.value)}
//                     required
//                     className="w-full border p-2 rounded"
//                 />
//                 <input
//                     type="text"
//                     placeholder="Parent Name(s) (comma separated)"
//                     value={parentName}
//                     onChange={(e) => setParentName(e.target.value)}
//                     className="w-full border p-2 rounded"
//                 />
//                 <input
//                     type="text"
//                     placeholder="Location (e.g., New York, USA)"
//                     value={location}
//                     onChange={(e) => setLocation(e.target.value)}
//                     className="w-full border p-2 rounded"
//                 />

//                 <div className="text-center">
//                     <Button type="submit" variant="contained">
//                         Add Member
//                     </Button>
//                 </div>
//             </form>

//             {/* Flow Diagram */}
//             <div
//                 ref={reactFlowWrapper}
//                 style={{ width: '100%', height: '70vh' }}
//                 className="border rounded-lg bg-white"
//             >
//                 <ReactFlow
//                     nodes={nodes}
//                     edges={edges}
//                     onNodesChange={onNodesChange}
//                     onEdgesChange={onEdgesChange}
//                     nodeTypes={nodeTypes}
//                     onNodeClick={(event, node) => { setSelectedNode(node), handleOpen() }}
//                     fitView
//                 >
//                     <Background />
//                     <Controls />
//                     <MiniMap />
//                 </ReactFlow>
//             </div>

//             <div className="rounded-lg pt-5">
//                 <FamilyMap members={nodes} />
//             </div>

//             {selectedNode && (
//                 <div>
//                     <Button onClick={handleOpen}>Open modal</Button>
//                     <Modal
//                         open={open}
//                         onClose={handleClose}
//                         aria-labelledby="modal-modal-title"
//                         aria-describedby="modal-modal-description"
//                     >
//                         <Box sx={style}>
//                             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                                 <form
//                                     onSubmit={(e) => {
//                                         handleUpdateMember(e);
//                                         handleClose();
//                                     }}
//                                     className="w-full max-w-xl bg-lime-100 p-6 rounded-xl shadow-lg space-y-6 border border-lime-300"
//                                 >
//                                     <h2 className="text-xl font-semibold text-center text-lime-800">Update Family Member</h2>

//                                     <input
//                                         type="text"
//                                         value={selectedNode.data.label}
//                                         onChange={(e) =>
//                                             setSelectedNode((prev) => ({
//                                                 ...prev,
//                                                 data: { ...prev.data, label: e.target.value }
//                                             }))
//                                         }
//                                         className="w-full border p-2 rounded"
//                                     />

//                                     <input
//                                         type="text"
//                                         value={selectedNode.data.relation}
//                                         onChange={(e) =>
//                                             setSelectedNode((prev) => ({
//                                                 ...prev,
//                                                 data: { ...prev.data, relation: e.target.value }
//                                             }))
//                                         }
//                                         className="w-full border p-2 rounded"
//                                     />

//                                     <input
//                                         type="date"
//                                         value={selectedNode.data.birthdate}
//                                         onChange={(e) =>
//                                             setSelectedNode((prev) => ({
//                                                 ...prev,
//                                                 data: { ...prev.data, birthdate: e.target.value }
//                                             }))
//                                         }
//                                         className="w-full border p-2 rounded"
//                                     />

//                                     <input
//                                         type="text"
//                                         value={selectedNode.data.location}
//                                         onChange={(e) =>
//                                             setSelectedNode((prev) => ({
//                                                 ...prev,
//                                                 data: { ...prev.data, location: e.target.value }
//                                             }))
//                                         }
//                                         className="w-full border p-2 rounded"
//                                     />

//                                     <div className="text-center">
//                                         <Button type="submit" variant="contained" color="Success">
//                                             Update Member
//                                         </Button>
//                                     </div>
//                                 </form>
//                             </div>
//                         </Box>
//                     </Modal>
//                 </div>
//             )}
//         </div>
//     );
// }








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

// Modal :
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { current } from '@reduxjs/toolkit';

const elk = new ELK();

// let id = 0;
// const getId = () => `node_${id++}`;

let id = 0;
const getId = (userId) => `${userId}_node_${id++}`;

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

        // Update the node with recalculated parents/children
        const updated = nodes.map((n) =>
            n.id === selectedNode.id
                ? {
                    ...n,
                    data: {
                        ...selectedNode.data,
                        parents: edges.filter(e => e.target === n.id).map(e => e.source),
                        children: edges.filter(e => e.source === n.id).map(e => e.target),
                    },
                }
                : n
        );

        setNodes(updated);
        layoutGraph(updated, edges);

        // Get the updated node data to send
        const updatedNode = updated.find(n => n.id === selectedNode.id);

        try {
            await fetch('http://localhost:3000/api/update-family-member', {
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
                const res = await fetch(`http://localhost:3000/api/fetchUser/${userEmail}`, {
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
        } catch (error) {
            console.error('ELK layout error:', error);
        }
    };

    // Add member handler, simplified to update nodes/edges and run Elk layout
    const handleAddMember = async (e) => {
        e.preventDefault();

        const newNodeId = getId(userId);
        const newNode = {
            id: newNodeId,
            type: 'custom',
            data: { label: childName, relation, birthdate, location, photo, parents: [], children: [] },
            position: { x: 0, y: 0 }, // will be set by layout
        };

        // Add new node and edges based on parents
        setNodes((nds) => {
            const updatedNodes = [...nds, newNode];

            setEdges((eds) => {
                const updatedEdges = [...eds];
                const parentNames = parentName
                    .split(',')
                    .map((name) => name.trim().toLowerCase());

                parentNames.forEach((pName) => {
                    const parentNode = updatedNodes.find(
                        (n) => n.data.label.toLowerCase() === pName
                    );

                    if (parentNode) {
                        const edgeId = `${parentNode.id}-${newNodeId}`;
                        if (!updatedEdges.some((e) => e.id === edgeId)) {
                            updatedEdges.push({
                                id: edgeId,
                                source: parentNode.id,
                                target: newNodeId,
                            });
                        }
                    }
                });

                // After edges updated, run layout again
                layoutGraph(updatedNodes, updatedEdges);

                return updatedEdges;
            });

            return updatedNodes;
        });
        // Save to backend (optional)
        try {
            // await fetch('http://localhost:3000/api/add-family-tree', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         newNodeId,
            //         name: childName,
            //         relation,
            //         birthdate,
            //         parentName,
            //         location,
            //         created_by: userId,
            //     }, formData),
            // });

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
            const response = await fetch('http://localhost:3000/api/add-family-tree', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                const newNode = {
                    id: newNodeId,
                    type: 'custom',
                    data: {
                        label: childName,
                        relation,
                        birthdate,
                        location,
                        photo: result.photoUrl, // Set the photo URL from the backend
                        parents: [],
                        children: []
                    },
                    position: { x: 0, y: 0 }, // will be set by layout
                };
                setNodes((nds) => [...nds, newNode]);
            }
        } catch (err) {
            console.error('Error adding node:', err);
        }
    };
    // Fetch tree and run layout on mount
    useEffect(() => {
        const fetchTree = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/family-tree/${userId}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    const nodesTemp = [];
                    const edgesTemp = [];
                    const nameToId = new Map();

                    const traverse = (node, parentId = null) => {
                        let nodeId;
                        if (nameToId.has(node.name)) {
                            nodeId = nameToId.get(node.name);
                        } else {
                            nodeId = getId(userId);
                            nameToId.set(node.name, nodeId);

                            const attrs = node.attributes || {};
                            const relation = attrs.relation || node.relation || '';
                            const birthdate = (attrs.birthdate || node.birthdate || '').split('T')[0];
                            const location = attrs.location || node.location || '';
                            const photo = attrs.photoUrl || '';

                            nodesTemp.push({
                                id: nodeId,
                                type: 'custom',
                                data: {
                                    label: node.name,
                                    relation,
                                    birthdate,
                                    location,
                                    photo,
                                    parents: [],
                                    children: [],
                                },
                                position: { x: 0, y: 0 },
                            });
                        }

                        if (parentId && parentId !== nodeId) {
                            const edgeId = `${parentId}-${nodeId}`;
                            if (!edgesTemp.find((e) => e.id === edgeId)) {
                                edgesTemp.push({ id: edgeId, source: parentId, target: nodeId });
                            }
                        }

                        if (node.children) {
                            node.children.forEach((child) => traverse(child, nodeId));
                        }
                    };


                    data.forEach((d) => traverse(d));

                    // Run elk layout before setting nodes and edges
                    await layoutGraph(nodesTemp, edgesTemp);
                    setEdges(edgesTemp);
                    setUpcoming(getUpcomingBirthdays(nodesTemp));
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchTree();
    }, [userId]);


    useEffect(() => {
        const getUpcomingBirthdays = (nodeList) => {
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

            const upcoming = [];

            nodeList.forEach((node) => {
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
                            email: node.data.email, // optional
                        });
                    }
                }
            });

            return upcoming.sort((a, b) => a.inDays - b.inDays);
        };

        const upcomingBirthdays = getUpcomingBirthdays(nodes); // ✅ fixed here
        setUpcoming(upcomingBirthdays);

        const bdayNotifEmail = currentUser.email;
        // Notify backend
        if (upcomingBirthdays.length > 0) {
            fetch('http://localhost:3000/api/bday-notification-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ birthdays: upcomingBirthdays, email: bdayNotifEmail }),
            }).catch((error) => console.error('Notification failed', error));
        }
    }, [nodes]); // ✅ run this whenever nodes change



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
                <input
                    type="text"
                    placeholder="Relation"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    required
                    className="w-full border p-2 rounded"
                />
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