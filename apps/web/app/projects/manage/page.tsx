"use client";

export default function ManageProjects() {
    const projects = [
        {
            id: 1,
            name: "Rainforest Recovery",
            type: "Reforestation",
            status: "Under Review",
            credits: 1500,
            progress: 25
        },
        {id: 2, name: "Solar Farm Initiative", type: "Solar Energy", status: "Approved", credits: 2500, progress: 60},
        {id: 3, name: "Wind Power Project", type: "Wind Energy", status: "Draft", credits: 1200, progress: 10}
    ];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Projects</h1>
                <a href="/projects/register" className="bg-blue-600 text-white px-4 py-2 rounded">
                    New Project
                </a>
            </div>

            <div className="grid gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold">{project.name}</h3>
                                <p className="text-gray-600">{project.type}</p>
                            </div>
                            <span className={`px-3 py-1 rounded text-sm ${
                                project.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    project.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                {project.status}
              </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Expected Credits</p>
                                <p className="text-lg font-semibold">{project.credits}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Progress</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{width: `${project.progress}%`}}
                                    ></div>
                                </div>
                                <p className="text-sm mt-1">{project.progress}%</p>
                            </div>
                            <div className="text-right">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Edit</button>
                                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded">View</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}