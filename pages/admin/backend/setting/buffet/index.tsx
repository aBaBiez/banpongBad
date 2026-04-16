import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Button, Container, Table } from 'react-bootstrap';
import { ShuttleCockTypes } from '../../booking/buffet';

type BuffetSetting = {
    id: number;
    court_price: number;
    shuttle_cock_price: number;
};

type BuffetSettingGroup = {
    regular: BuffetSetting | null;
    student: BuffetSetting | null;
    university: BuffetSetting | null;
};

function BuffetSetting() {
    // State for standard buffet settings
    const [settings, setSettings] = useState<BuffetSettingGroup>({
        regular: null,
        student: null,
        university: null
    });

    const [editingStandardSetting, setEditingStandardSetting] = useState<{
        data: BuffetSetting | null;
        type: 'regular' | 'student' | 'university';
    } | null>(null);

    // Shuttlecock types
    const [shuttleCockTypes, setShuttleCockTypes] = useState<ShuttleCockTypes[]>([]);
    const [editingShuttlecock, setEditingShuttlecock] = useState<ShuttleCockTypes | null>(null);
    // Fetch all data on component mount
    useEffect(() => {
        getBuffetSettings();
        getShuttleCockTypes();
    }, []);

    // Fetch shuttlecock types
    const getShuttleCockTypes = async () => {
        try {
            const response = await fetch('/api/admin/buffet/get_shuttlecock_types');
            if (response.ok) {
                setShuttleCockTypes(await response.json());
            } else {
                console.error('Failed to fetch shuttlecock types');
            }
        } catch (error) {
            console.error('Error fetching shuttlecock types:', error);
        }
    };

    // Fetch standard buffet settings
    const getBuffetSettings = async () => {
        try {
            const response = await fetch('/api/admin/buffet_setting');
            if (response.ok) {
                const data = await response.json();
                setSettings({
                    regular: data[0],
                    student: data[1],
                    university: data[2]
                });
            } else {
                console.error('Failed to fetch buffet settings');
            }
        } catch (error) {
            console.error('Error fetching buffet settings:', error);
        }
    };

    // Update buffet settings
    const updateBuffetSetting = async () => {
        const editingSettings = editingStandardSetting;
        if (!editingSettings) return;

        try {
            const response = await fetch('/api/admin/buffet_setting', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSettings.data),
            });

            if (response.ok) {
                getBuffetSettings();
                setEditingStandardSetting(null);
            } else {
                console.error('Failed to update buffet settings');
            }
        } catch (error) {
            console.error('Error updating buffet settings:', error);
        }
    };

    // Update shuttlecock price
    const updateShuttlecockPrice = async (id: number) => {

        if (!editingShuttlecock) return;

        try {
            const response = await fetch(`/api/admin/buffet/edit_shuttlecock_type`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingShuttlecock),
            });

            if (response.ok) {
                getShuttleCockTypes();
                setEditingShuttlecock(null);
            } else {
                console.error('Failed to update shuttlecock price');
            }
        } catch (error) {
            console.error('Error updating shuttlecock price:', error);
        }
    };

    // Handle input change for buffet settings
    const handleSettingChange = (field: keyof BuffetSetting, value: number) => {
        const editingSettings = editingStandardSetting;
        if (!editingSettings) return;
        setEditingStandardSetting({
            ...editingSettings,
            data: {
                ...editingSettings.data!,
                [field]: value
            }
        });
    };

    // Handle input change for shuttlecock price
    const handleShuttlecockPriceChange = (id: number, price: number) => {
        setShuttleCockTypes(prev =>
            prev.map(type => type.id === id ? { ...type, price } : type)
        );
    };

    // Render buffet settings table
    const renderBuffetTable = () => {
        const currentSettings = settings;
        const title = 'ตั้งค่าตีบุฟเฟ่ต์';

        return (
            <>
                <div className="d-flex justify-content-center mt-5 mb-3">
                    <h4 className="fw-bold">{title}</h4>
                </div>
                <Table bordered striped hover size="sm" className="text-center">
                    <thead className="table-primary">
                        <tr>
                            <th>ประเภท</th>
                            <th>ค่าสนาม</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderSettingRow('บุคคลทั่วไป', currentSettings.regular, 'regular')}
                        {renderSettingRow('นักเรียน', currentSettings.student, 'student')}
                        {renderSettingRow('มหาวิทยาลัย', currentSettings.university, 'university')}
                    </tbody>
                </Table>
            </>
        );
    };

    // Render a single row in buffet settings table
    const renderSettingRow = (label: string, setting: BuffetSetting | null, type: 'regular' | 'student' | 'university') => {
        if (!setting) return null;
        const editingSettings = editingStandardSetting;
        const isEditing = editingSettings?.data?.id === setting.id;
        const setEditingSettings = setEditingStandardSetting;
        return (
            <tr>
                <td>{label}</td>
                <td>
                    {isEditing ? (
                        <input
                            type="number"
                            className="form-control text-center"
                            value={editingSettings?.data?.court_price}
                            onChange={(e) => handleSettingChange('court_price', +e.target.value)}
                        />
                    ) : (
                        setting.court_price
                    )}
                </td>
                <td>
                    {isEditing ? (
                        <div className="d-flex justify-content-center gap-2">
                            <Button
                                variant="success"
                                size="sm"
                                onClick={updateBuffetSetting}
                            >
                                บันทึก
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setEditingSettings(null)}
                            >
                                ยกเลิก
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => setEditingSettings({
                                data: { ...setting },
                                type
                            })}
                        >
                            แก้ไข
                        </Button>
                    )}
                </td>
            </tr>
        );
    };

    // Render shuttlecock settings table
    const renderShuttlecockTable = () => (
        <>
            <div className="d-flex justify-content-center mt-5 mb-3">
                <h4 className="fw-bold">ตั้งค่าราคาลูกแบด</h4>
            </div>
            <Table bordered striped hover size="sm" className="text-center">
                <thead className="table-primary">
                    <tr>
                        <th>รหัส</th>
                        <th>ชื่อ</th>
                        <th>ราคาต่อลูก</th>
                        <th>สถานะ</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {shuttleCockTypes.map((type) => (
                        <tr key={type.id}>
                            <td>
                                {editingShuttlecock?.id === type.id ? (
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        value={editingShuttlecock.code}
                                        onChange={(e) => setEditingShuttlecock(prev =>
                                            prev ? { ...prev, code: e.target.value } : null
                                        )}
                                    />
                                ) : (
                                    type.code
                                )}
                            </td>
                            <td>
                                {editingShuttlecock?.id === type.id ? (
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        value={editingShuttlecock.name}
                                        onChange={(e) => setEditingShuttlecock(prev =>
                                            prev ? { ...prev, name: e.target.value } : null
                                        )}
                                    />
                                ) : (
                                    type.name
                                )}
                            </td>
                            <td>
                                {editingShuttlecock?.id === type.id ? (
                                    <input
                                        type="number"
                                        className="form-control text-center"
                                        value={editingShuttlecock.price}
                                        onChange={(e) => setEditingShuttlecock(prev =>
                                            prev ? { ...prev, price: +e.target.value } : null
                                        )}
                                    />
                                ) : (
                                    type.price
                                )}
                            </td>
                            <td>
                                {editingShuttlecock?.id === type.id ? (
                                    <div className="form-check form-switch d-flex justify-content-center">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={editingShuttlecock.isActive}
                                            onChange={(e) => setEditingShuttlecock(prev =>
                                                prev ? { ...prev, isActive: e.target.checked } : null
                                            )}
                                        />
                                        <label className="form-check-label ms-2">
                                            {editingShuttlecock.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </label>
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center">
                                        <span className={`badge ${type.isActive ? 'bg-success' : 'bg-danger'}`}>
                                            {type.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </div>
                                )}
                            </td>
                            <td>
                                {editingShuttlecock?.id === type.id ? (
                                    <div className="d-flex justify-content-center gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => updateShuttlecockPrice(type.id)}
                                        >
                                            บันทึก
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setEditingShuttlecock(null)}
                                        >
                                            ยกเลิก
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => setEditingShuttlecock(type)}
                                    >
                                        แก้ไข
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    return (
        <>
            <Head>
                <title>ตั้งค่าราคาบุฟเฟ่ต์</title>
            </Head>
            <Container className="py-5">
                <h2 className="text-center mb-4">การตั้งค่าราคา</h2>
                {renderBuffetTable()}
                {renderShuttlecockTable()}
            </Container>
        </>
    );
}

export default BuffetSetting;
