import React from 'react'

export default function About() {
    return (
        <>
            <section className="py-10 px-4">
                <h1 className="text-3xl font-bold text-center mb-6">About FamTree</h1>
                <p className="text-lg text-center max-w-2xl mx-auto">
                    FamTree is a user-friendly application designed to help you create, manage, and explore your family tree.
                    Whether you're a genealogy enthusiast or just looking to document your family's history, FamTree provides
                    the tools you need to visualize and share your family connections.
                </p>
            </section>
            <section className="py-10 px-4 bg-gray-100">
                <h2 className="text-2xl font-semibold text-center mb-4">Key Features</h2>
                <ul className="list-disc list-inside max-w-2xl mx-auto">
                    <li className="mb-2">🌳 **Create Family Trees**: Easily add family members and visualize relationships.</li>
                    <li className="mb-2">📸 **Upload Photos**: Attach photos to family members to bring your tree to life.</li>
                    <li className="mb-2">📅 **Document Events**: Record important dates and events in your family's history.</li>
                    <li className="mb-2">🌐 **Share with Family**: Invite family members to view and contribute to your family tree.</li>
                </ul>
            </section>
            <section className="py-10 px-4">
                <h2 className="text-2xl font-semibold text-center mb-4">How It Works</h2>
                <p className="text-lg text-center max-w-2xl mx-auto">
                    Getting started with FamTree is simple! Just create an account, and you can begin adding family members
                    to your tree. Use our intuitive interface to connect relatives, upload photos, and document important
                    milestones. Your family tree will grow as you add more information, making it a valuable resource for
                    generations to come.
                </p>
            </section>

        </>
    )
}
