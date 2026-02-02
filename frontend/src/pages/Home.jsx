import React from 'react';
import DareList from '../components/DareList';
import DareDetails from '../components/DareDetails';

export default function Home({
    filteredDares,
    activeDareId,
    setActiveDareId,
    activeTab,
    setActiveTab,
    activeDare
}) {
    return (
        <div className="content-area">
            <DareList
                dares={filteredDares}
                activeDareId={activeDareId}
                onSelectDare={setActiveDareId}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <DareDetails dare={activeDare} />
        </div>
    );
}
