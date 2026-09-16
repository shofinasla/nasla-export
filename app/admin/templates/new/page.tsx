import Link from "next/link"; import {createTemplate} from "../actions";
export default function Page(){return <main className="max-w-3xl"><Link href="/admin/templates" className="text-sm font-bold text-slate-500">← Back</Link><h1 className="mt-4 text-3xl font-black">Add Template</h1><form action={createTemplate} className="card mt-8 grid gap-5">
 <Field label="Name" name="name" required/><Field label="Slug" name="slug" placeholder="export-company"/><Field label="Category" name="category" required/>
 <div><label className="mb-2 block text-sm font-bold">Price (IDR)</label><input className="input" name="price" type="number" min="0" step="1" defaultValue="0"/></div>
 <div><label className="mb-2 block text-sm font-bold">Description</label><textarea className="input min-h-36" name="description"/></div>
 <Field label="Demo URL" name="demo_url" type="url"/><Field label="Preview Image URL" name="preview_image" type="url"/><Field label="Storage Path" name="storage_path"/>
 <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" name="is_published"/> Publish immediately</label>
 <div className="flex gap-3"><button className="btn btn-primary">Save Template</button><Link className="btn btn-secondary" href="/admin/templates">Cancel</Link></div></form></main>}
function Field(p:{label:string,name:string,type?:string,required?:boolean,placeholder?:string,defaultValue?:string}){return <div><label className="mb-2 block text-sm font-bold">{p.label}</label><input className="input" name={p.name} type={p.type||"text"} required={p.required} placeholder={p.placeholder} defaultValue={p.defaultValue}/></div>}
