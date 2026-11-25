import Counter from '../models/CountModel.js';

const genNextSequence = async(sequenceName, session = null, next) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      {
        // new: true,
        returnDocument: 'after',
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
        ...(session && { session }),
      },
    );

    return counter.seq;
  } catch(err) {
    console.error('GenNextSequence error: ', err.message);
    throw err;
  };  
};

export default genNextSequence;