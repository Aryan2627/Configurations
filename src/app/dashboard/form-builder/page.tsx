"use client";
import React, { useState, useEffect } from 'react';

export default function FormBuilder() {
  const [configs, setConfigs] = useState([]);
  const [formName, setFormName] = useState('Intake');
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [optionsStr, setOptionsStr] = useState('');

  const fetchConfigs = async () => {
    // using a dummy org ID for now
    const res = await fetch('/api/form-config?orgId=org_1');
    if (res.ok) {
      setConfigs(await res.json());
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async () => {
    if (!fieldName || !fieldLabel) return alert('Enter field name and label');
    let options: string[] = [];
    if (optionsStr) {
      options = optionsStr.split(',').map(s => s.trim());
    }
    await fetch('/api/form-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgId: 'org_1',
        formName,
        fieldName,
        fieldLabel,
        fieldType: 'dropdown',
        options
      })
    });
    setFieldName('');
    setFieldLabel('');
    setOptionsStr('');
    fetchConfigs();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/form-config?id=' + id, { method: 'DELETE' });
    fetchConfigs();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Form Configuration Builder</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Custom Field</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Form</label>
            <select value={formName} onChange={e=>setFormName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none">
              <option value="Intake">Intake Form</option>
              <option value="Product">Product Catalog Form</option>
              <option value="Category">Category Form</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Field Name (Internal Key)</label>
            <input value={fieldName} onChange={e=>setFieldName(e.target.value)} placeholder="e.g. custom_department" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Field Display Label</label>
            <input value={fieldLabel} onChange={e=>setFieldLabel(e.target.value)} placeholder="e.g. Department" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Dropdown Options (Comma separated)</label>
            <input value={optionsStr} onChange={e=>setOptionsStr(e.target.value)} placeholder="IT, HR, Finance" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none" />
          </div>
        </div>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded">Save Field</button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Active Configurations</h2>
        <div className="space-y-4">
          {configs.map((c: any) => (
            <div key={c.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
              <div>
                <span className="bg-gray-700 text-xs px-2 py-1 rounded mr-3">{c.formName}</span>
                <strong className="text-lg">{c.fieldLabel}</strong> <span className="text-gray-500">({c.fieldName})</span>
                <p className="text-sm text-gray-400 mt-1">Options: {JSON.parse(c.options || '[]').join(', ')}</p>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300">Delete</button>
            </div>
          ))}
          {configs.length === 0 && <p className="text-gray-500">No custom fields configured yet.</p>}
        </div>
      </div>
    </div>
  );
}
