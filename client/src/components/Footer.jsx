import React from 'react'
import { Footer, FooterCopyright, FooterLink, FooterLinkGroup } from "flowbite-react";

export default function FooterComp() {
    const customFooter = {
        root: {
            base: "w-full bottom-0 left-0 rounded-lg bg-white shadow-2xl border border-gray-300 md:flex md:items-center md:justify-between dark:bg-white",
            container: "w-full p-6",
            bgDark: "bg-white"
        }
    }
    return (
        <div>
            <Footer container theme={customFooter}>
                <FooterCopyright href="#" by="FamTree" year={2025} />
            </Footer>
        </div>
    )
}
