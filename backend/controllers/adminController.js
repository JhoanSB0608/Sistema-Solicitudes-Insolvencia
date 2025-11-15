const Solicitud = require('../models/solicitudModel');
const User = require('../models/userModel');
const Acreedor = require('../models/acreedorModel');

// @desc    Obtener estadísticas para el dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalSolicitudes = await Solicitud.countDocuments({});
    const totalUsuarios = await User.countDocuments({});
    const totalAcreedores = await Acreedor.countDocuments({});

    const solicitudesPorTipo = await Solicitud.aggregate([
      { $group: { _id: '$tipoSolicitud', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const solicitudesPorMes = await Solicitud.aggregate([
        { $group: { 
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, 
            count: { $sum: 1 } 
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ 
      totalSolicitudes, 
      totalUsuarios,
      totalAcreedores,
      solicitudesPorTipo, 
      solicitudesPorMes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// @desc    Obtener historial de solicitudes con paginación
// @route   GET /api/admin/solicitudes
// @access  Private/Admin
const getSolicitudes = async (req, res) => {
  try {
    const { pageIndex = 0, pageSize = 10, filters = '[]', sorting = '[]' } = req.query;
    const query = {}; // Admin ve todas las solicitudes, no solo las suyas

    // Lógica de filtros por columna
    const parsedFilters = JSON.parse(filters);
    if (parsedFilters.length > 0) {
      query.$and = parsedFilters.map(filter => {
        // Si filtramos por usuario, necesitamos buscar en el campo anidado 'user.name' o 'user.email'
        if (filter.id === 'user') {
          return { 
            $or: [
              { 'user.name': { $regex: filter.value, $options: 'i' } },
              { 'user.email': { $regex: filter.value, $options: 'i' } },
            ]
          }
        }
        return { [filter.id]: { $regex: filter.value, $options: 'i' } };
      });
    }

    // Lógica de ordenamiento
    const parsedSorting = JSON.parse(sorting);
    const sortOptions = parsedSorting.length > 0
      ? parsedSorting.reduce((acc, sort) => {
          acc[sort.id] = sort.desc ? -1 : 1;
          return acc;
        }, {})
      : { createdAt: -1 };

    const count = await Solicitud.countDocuments(query);
    const solicitudes = await Solicitud.find(query)
      .populate('user', 'name email')
      .sort(sortOptions)
      .limit(parseInt(pageSize))
      .skip(parseInt(pageIndex) * parseInt(pageSize));

    res.json({ 
      rows: solicitudes, 
      pageCount: Math.ceil(count / parseInt(pageSize)),
      totalRows: count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes', error: error.message });
  }
};

module.exports = { getStats, getSolicitudes };