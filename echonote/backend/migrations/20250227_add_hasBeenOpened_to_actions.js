module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Actions', 'hasBeenOpened', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Actions', 'hasBeenOpened');
  }
};
