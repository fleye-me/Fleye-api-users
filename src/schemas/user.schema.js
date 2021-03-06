module.exports = {
  name: {
    create: {
      required: true,
    },
    update: {
      required: false,
    },
  },
  id: {
    required: true,
  },
  age: {
    required: false,
  },
  email: {
    required: true,
    unique: true,
  },
};
