import { handleCommand } from "./helpers";

describe("handleCommand", () => {
  const items: any[] = [
    { id: "1", name: "docs", type: "folder", parentId: null },
    { id: "2", name: "readme.txt", type: "txt", parentId: null },
    { id: "3", name: "inner", type: "folder", parentId: "1" },
  ];

  const userLogin = "alex";

  // Простые команды

  test("whoami returns user login", () => {
    const result = handleCommand(
      "whoami",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("alex");
  });

  test("pwd returns currentPath", () => {
    const result = handleCommand(
      "pwd",
      items,
      userLogin,
      "1",
      "~/docs",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("~/docs");
  });

  test("help returns list of commands", () => {
    const result = handleCommand(
      "help",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toContain("help");
  });

  test("hello returns greeting with login", () => {
    const result = handleCommand(
      "hello",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("Hello, alex!");
  });

  test("echo returns text", () => {
    const result = handleCommand(
      "echo Hello World",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("Hello World");
  });

  test("date returns a string", () => {
    const result = handleCommand(
      "date",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(typeof result).toBe("string");
  });

  // Команды с изменением state

  test("cd changes folder and path", () => {
    const setId = jest.fn();
    const setPath = jest.fn();

    const result = handleCommand(
      "cd docs",
      items,
      userLogin,
      null,
      "~",
      setId,
      setPath,
    );

    expect(result).toBeNull();
    expect(setId).toHaveBeenCalledWith("1");
    expect(setPath).toHaveBeenCalledWith("~/docs");
  });

  test("cd .. goes to parent folder or root", () => {
    const setId = jest.fn();
    const setPath = jest.fn();

    // from inner folder
    handleCommand(
      "cd ..",
      items,
      userLogin,
      "3",
      "~/docs/inner",
      setId,
      setPath,
    );
    expect(setId).toHaveBeenCalledWith("1");
    expect(setPath).toHaveBeenCalledWith("~/docs");

    // from root
    const setIdRoot = jest.fn();
    const setPathRoot = jest.fn();
    const resultRoot = handleCommand(
      "cd ..",
      items,
      userLogin,
      null,
      "~",
      setIdRoot,
      setPathRoot,
    );

    expect(resultRoot).toBe("Already at root");
    expect(setIdRoot).not.toHaveBeenCalled();
    expect(setPathRoot).not.toHaveBeenCalled();
  });

  test("mkdir returns object with folder info", () => {
    const result = handleCommand(
      "mkdir newFolder",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toEqual({
      type: "mkdir",
      folderName: "newFolder",
      parentId: null,
    });
  });

  test("touch returns object with file info", () => {
    const result = handleCommand(
      "touch newFile.txt",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toEqual({
      type: "touch",
      fileName: "newFile.txt",
      parentId: null,
    });
  });

  // Ошибочные случаи

  test("unknown command returns error message", () => {
    const result = handleCommand(
      "foobar",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("Command not found: foobar");
  });

  test("nano without argument returns usage message", () => {
    const result = handleCommand(
      "nano",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("Usage: nano <filename>");
  });

  test("mkdir without argument returns usage message", () => {
    const result = handleCommand(
      "mkdir",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("Usage: mkdir <foldername>");
  });

  test("touch without argument returns usage message", () => {
    const result = handleCommand(
      "touch",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("Usage: touch <filename>");
  });

  test("nano non-existent file returns error", () => {
    const result = handleCommand(
      "nano unknown.txt",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("File not found: unknown.txt");
  });

  test("ls returns (empty) for empty folder", () => {
    const result = handleCommand(
      "ls",
      [],
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBe("(empty)");
  });

  test("nano opens existing file", () => {
    const result = handleCommand(
      "nano readme.txt",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toEqual({ type: "openFolder", id: "2" });
  });

  test("exit returns correct object", () => {
    const result = handleCommand(
      "exit",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toEqual({ type: "exit" });
  });

  test("clear returns null", () => {
    const result = handleCommand(
      "clear",
      items,
      userLogin,
      null,
      "~",
      jest.fn(),
      jest.fn(),
    );
    expect(result).toBeNull();
  });
});
