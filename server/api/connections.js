const router = require("express").Router();
const { Op } = require("sequelize");
const {
  models: { User, Line, Station },
} = require("../db");
const { loggedIn } = require("./gatekeepingMiddleware");
module.exports = router;

// GET /api/connections/
router.get("/", loggedIn, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const loggedInUser = await User.findByPk(userId);
    const userLines = await loggedInUser.getLines();

    const userLineNames = userLines.map((line) => line.name);

    const connectionsIds = [];
    // Map over lines array to find corresponding users
    for (let i = 0; i < userLines.length; i++) {
      const usersOnLine = await userLines[i].getUsers();

      const filteredUsers = usersOnLine.filter((user) => {
        // Is the user the logged in user, if so ignore
        if (user.id !== userId) return true;
      });

      for (let j = 0; j < filteredUsers.length; j++) {
        connectionsIds.push(filteredUsers[j].id);
      }
    }

    // Filter connectionsArr to remove duplicate user objects
    const filteredIds = connectionsIds.filter(
      (value, index) => connectionsIds.indexOf(value) === index
    );

    const connectionsObjects = await User.findAll({
      where: {
        id: {
          [Op.in]: filteredIds,
        },
      },
      include: [
        {
          model: Station,
          include: { model: Line, where: { name: { [Op.in]: userLineNames } } },
        },
        {
          model: User,
          required: false,
          as: "requestor",
          attributes: ["id"],
          where: {
            id: userId,
          },
        },
        {
          model: User,
          required: false,
          as: "requestee",
          attributes: ["id"],
          where: {
            id: userId,
          },
        },
      ],
    });

    const connectionsObjectsSimpleLines = connectionsObjects.map(
      (connection) => {
        connection = connection.get({ plain: true });
        connection.stations = connection.stations.map((station) => {
          // for each station, map lines prop to array of line names
          station.lines = station.lines.map((line) => line.name);
          return station;
        });
        return connection;
      }
    );

  
    res.json(connectionsObjectsSimpleLines);
  } catch (err) {
    next(err);
  }
});
