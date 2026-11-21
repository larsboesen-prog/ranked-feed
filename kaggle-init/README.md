# Starting points for training runs on Kaggle

Kaggle notebooks read the code from this branch when they start; files they need that no notebook output can carry live here.

- `ears-v2-best.fp16.pt`: the tiny ears' checkpoint behind `tiny-speech/engines/ears/ears-int8-2026-11-20.onnx` (Kaggle
  `tiny-ears-train` version 2, step 28,735), weights in half precision. That run's output cannot be a notebook input (it ended
  "ERROR" at a too-strict export gate, fixed since). `tiny-speech/training/ears/run.py --mode english` trains on top of it.
  CC BY-SA 4.0, like the model (`tiny-speech/models/ears.md`).
